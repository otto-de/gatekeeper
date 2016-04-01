import json
import uuid

import config
import util
from delorean import Delorean
from errors import EnvironmentNotFound
from errors import GateAlreadyExists
from errors import GateNameNotValid
from errors import GateNotFound
from errors import GateStateNotValid
from errors import JsonStructureError
from errors import JsonValidationError
from errors import NotMasterError
from errors import TicketNotFound
from flask import Response, request, Blueprint

blueprint = Blueprint('api', __name__)
blueprint.mongo = None


@blueprint.route('/api/services', methods=['PUT'])
def api_test_and_set():
    try:
        status = "ok"
        data = data_from_request()
        ticket_id = (data["ticket"] if "ticket" in data else None)
        ticket = (blueprint.mongo.get_ticket(ticket_id) if ticket_id else None)

        if ticket_id and not ticket:
            raise TicketNotFound
        if ticket:
            date = Delorean.now().epoch
            if ticket['expiration_date'] != 0 and ticket['expiration_date'] < date:
                raise TicketNotFound
        if "services" not in data:
            raise JsonStructureError("Could not find services")

        for name in data["services"]:
            entry = blueprint.mongo.get_gate(name)
            if type(data["services"][name]) != type(list()):
                data["services"][name] = [data["services"][name]]
            for env in data["services"][name]:
                if check_gate(entry, env, ticket_id):
                    if request.args and request.args['queue']:
                        status = "queued"
                        break
                    return Response('{"status": "denied"}', status=200, mimetype='application/json')

        if status == "queued":
            expiration_date = blueprint.mongo.get_expiration_date(config.TICKET_QUEUE_LIFETIME)
        else:
            expiration_date = blueprint.mongo.get_expiration_date(
                config.TICKET_MAX_LIFETIME) if config.TICKET_MAX_LIFETIME != 0 else 0
        if not ticket:
            ticket = {"id": str(uuid.uuid4()),
                      "updated": Delorean.now().format_datetime(format='y-MM-dd HH:mm:ssz'),
                      "expiration_date": expiration_date,
                      "link": data["link"] if "link" in data else None}
            for name in data["services"]:
                if type(data["services"][name]) != type(list()):
                    data["services"][name] = [data["services"][name]]
                for env in data["services"][name]:
                    blueprint.mongo.add_ticket(name, env, ticket)
                    response = {
                        "status": status,
                        "ticket": ticket
                    }
        else:
            ticket.update({"expiration_date": expiration_date})
            ticket.update({"updated": Delorean.now().format_datetime(format='y-MM-dd HH:mm:ssz')})
            blueprint.mongo.set_ticket_expiration_date(ticket["id"], expiration_date)
            response = {
                "status": status,
                "ticket": ticket
            }

        return Response(json.dumps(response), status=200, mimetype='application/json')
    except (GateNotFound, NotMasterError, GateAlreadyExists, GateNameNotValid, JsonValidationError, JsonStructureError,
            TicketNotFound) as error:
        return error_response(error)


@blueprint.route('/api/services/<string:name>', methods=['POST'])
def api_new_gate(name=None):
    try:
        data = data_from_request()
        entry = blueprint.mongo.new_gate(name, data)
        return Response(json.dumps(entry), status=200, mimetype='application/json')
    except (NotMasterError, GateAlreadyExists, GateNameNotValid, JsonValidationError, JsonStructureError) as error:
        return error_response(error)


@blueprint.route('/api/services/<string:name>', methods=['GET'])
@blueprint.route('/api/services/<string:name>/<string:environment>', methods=['GET'])
def api_get_gate(name, environment=None):
    try:
        entry = blueprint.mongo.get_gate(name)
        if environment and environment not in entry['environments']:
            raise EnvironmentNotFound
        for env in entry['environments']:
            if check_gate(entry, env):
                entry['environments'][env]['state'] = "closed"
        if environment:
            entry = entry['environments'][environment]
        return Response(json.dumps(entry), status=200, mimetype='application/json')
    except (GateNotFound, EnvironmentNotFound) as error:
        return error_response(error)


@blueprint.route('/api/services/<string:name>', methods=['PUT'])
@blueprint.route('/api/services/<string:name>/<string:environment>', methods=['PUT'])
def api_update_gate(name, environment=None):
    try:
        data = data_from_request()
        entry = blueprint.mongo.get_gate(name)

        if "group" in data:
            entry["group"] = data["group"]
            blueprint.mongo.update_gate(name, entry)
        if "name" in data:
            entry["name"] = data["name"]
            blueprint.mongo.update_gate(name, entry)
            name = data["name"]

        if environment:
            if "state" in data:
                blueprint.mongo.set_gate(name, environment, data["state"])
            if "message" in data:
                blueprint.mongo.set_message(name, environment, data["message"])
        else:
            if "environments" in data:
                for env in data["environments"]:
                    if "state" in data["environments"][env]:
                        blueprint.mongo.set_gate(name, env, data["environments"][env]["state"])
                    if "message" in data["environments"][env]:
                        blueprint.mongo.set_message(name, env, data["environments"][env]["message"])
        entry = blueprint.mongo.get_gate(name)
        return Response(json.dumps(entry), status=200, mimetype='application/json')
    except (NotMasterError, GateNameNotValid, GateNotFound, GateStateNotValid, EnvironmentNotFound, JsonValidationError,
            JsonStructureError) as error:
        return error_response(error)


@blueprint.route('/api/services/<string:name>', methods=['DELETE'])
def api_remove_gate(name):
    try:
        blueprint.mongo.remove_gate(name)
        return Response('{"status": "ok"}', status=200, mimetype='application/json')
    except(GateNotFound, NotMasterError) as error:
        return error_response(error)


@blueprint.route('/api/tickets/<string:ticket_id>', methods=['DELETE'])
def api_release(ticket_id):
    try:
        blueprint.mongo.remove_ticket(ticket_id)
        return Response('{"status": "ok"}', status=200, mimetype='application/json')
    except (NotMasterError, GateAlreadyExists, GateNameNotValid, JsonValidationError, JsonStructureError,
            TicketNotFound) as error:
        return error_response(error)


def data_from_request():
    try:
        data = json.loads(request.data)
    except ValueError or TypeError as error:
        raise JsonValidationError()
    return data


def check_gate(entry, env, ticket_id=None):
    return env not in entry['environments'] or \
           entry['environments'][env]['state'] == 'closed' or \
           queue_is_blocked(entry['environments'][env]['queue'], ticket_id) or \
           (env in blueprint.config and not util.are_manual_settings_observed(blueprint.config, env))


def queue_is_blocked(queue, ticket_id=None):
    if not queue:
        return False
    queue = clean_queue(queue)
    date = Delorean.now().epoch
    for t in queue:
        if ticket_id and t["id"] == ticket_id:
            if t["expiration_date"] == 0 or t["expiration_date"] > date:
                return False
        if t["expiration_date"] == 0 or t["expiration_date"] > date:
            return True
    return False


def clean_queue(queue):
    date = Delorean.now().epoch
    for t in queue:
        if t["expiration_date"] != 0 and t["expiration_date"] < date:
            queue.remove(t)
            try:
                blueprint.mongo.remove_ticket(t["expiration_date"])
            except TicketNotFound:
                pass
    return queue


def error_response(exception):
    return Response('{"status": "error", "reason": "' + exception.message + '"}',
                    status=exception.status_code if getattr(exception, 'status_code', None) else 400,
                    mimetype='application/json')
