import json
import uuid

import config
import util
from delorean import Delorean
from errors import EnvironmentNotFound
from errors import ServiceAlreadyExists
from errors import ServiceNameNotValid
from errors import NotFound
from errors import GateStateNotValid
from errors import JsonStructureError
from errors import JsonValidationError
from errors import NotMasterError
from errors import TicketNotFound
from flask import Response, request, Blueprint

blueprint = Blueprint('api', __name__)
blueprint.mongo = None


@blueprint.route('/api/gates', methods=['PUT'])
def api_test_and_set():
    try:
        status = "ok"
        data = util.data_from_request()
        ticket_id = (data["ticket"] if "ticket" in data else None)
        ticket = (blueprint.mongo.get_ticket(ticket_id) if ticket_id else None)

        if ticket_id and not ticket:
            raise TicketNotFound

        if "gates" not in data:
            raise JsonStructureError("Could not find gates")  # TODO extract string into errors

        for group, services in data['gates'].iteritems():
            for service, environments in services.iteritems():
                entry = blueprint.mongo.get_gate(group, service)
                for env in as_list(environments):
                    if check_gate(entry, env, ticket_id):
                        if request.args and request.args['queue']:
                            status = "queued"
                            break
                        return Response('{"status": "denied"}', status=200, mimetype='application/json')
        if status == "queued":
            expiration_date = blueprint.mongo.get_expiration_date(config.QUEUED_TICKET_LIFETIME)
        else:
            expiration_date = blueprint.mongo.get_expiration_date(
                config.CURRENT_TICKET_LIFETIME) if config.CURRENT_TICKET_LIFETIME != 0 else 0

        if not ticket:
            ticket_id = str(uuid.uuid4())
            ticket = {"id": ticket_id,
                      "updated": get_now_timestamp(),
                      "expiration_date": expiration_date,
                      "link": data["link"] if "link" in data else None}

            for group, services in data['gates'].iteritems():
                for service, environments in services.iteritems():
                    for env in as_list(environments):
                        blueprint.mongo.add_ticket_link(group, service, env, ticket_id)

            blueprint.mongo.add_ticket(ticket_id, ticket)

        else:
            ticket.update({"expiration_date": expiration_date})
            ticket.update({"updated": get_now_timestamp()})
            blueprint.mongo.update_ticket(ticket["id"], ticket)

        response = {
            "status": status,
            "ticket": ticket
        }
        return Response(json.dumps(response), status=200, mimetype='application/json')
    except (NotFound, NotMasterError, ServiceAlreadyExists, ServiceNameNotValid, JsonValidationError,
            JsonStructureError,
            TicketNotFound) as error:
        return error_response(error)


@blueprint.route('/api/services', methods=['PUT'])
def api_legacy_test_and_set():
    try:
        status = "ok"
        data = util.data_from_request()
        ticket_id = (data["ticket"] if "ticket" in data else None)
        ticket = (blueprint.mongo.get_ticket(ticket_id) if ticket_id else None)

        if ticket_id and not ticket:
            raise TicketNotFound

        if "services" not in data:
            raise JsonStructureError("Could not find services")  # TODO extract string into errors

        for service in data['services']:
            entry = blueprint.mongo.legacy_get_gate(service)
            for environment in data['services'][service]:
                if check_gate(entry, environment, ticket_id):
                    if request.args and request.args['queue']:
                        status = "queued"
                        break
                    return Response('{"status": "denied"}', status=200, mimetype='application/json')
        if status == "queued":
            expiration_date = blueprint.mongo.get_expiration_date(config.QUEUED_TICKET_LIFETIME)
        else:
            expiration_date = blueprint.mongo.get_expiration_date(
                config.CURRENT_TICKET_LIFETIME) if config.CURRENT_TICKET_LIFETIME != 0 else 0

        if not ticket:
            ticket_id = str(uuid.uuid4())
            ticket = {"id": ticket_id,
                      "updated": get_now_timestamp(),
                      "expiration_date": expiration_date,
                      "link": data["link"] if "link" in data else None}

            for service in data['services']:
                for environment in data['services'][service]:
                    blueprint.mongo.legacy_add_ticket_link(service, environment, ticket_id)

            blueprint.mongo.add_ticket(ticket_id, ticket)

        else:
            ticket.update({"expiration_date": expiration_date})
            ticket.update({"updated": get_now_timestamp()})
            blueprint.mongo.update_ticket(ticket["id"], ticket)

        response = {
            "status": status,
            "ticket": ticket
        }
        return Response(json.dumps(response), status=200, mimetype='application/json')
    except (NotFound, NotMasterError, ServiceAlreadyExists, ServiceNameNotValid, JsonValidationError,
            JsonStructureError,
            TicketNotFound) as error:
        return error_response(error)


def as_list(environments):
    if type(environments) != type(list()):
        environments = [environments]
    return environments


def get_now_timestamp():
    return Delorean.now().format_datetime(format='y-MM-dd HH:mm:ssz')


@blueprint.route('/api/gates/<string:group>/<string:name>', methods=['POST'])
def api_new_gate(group, name):
    try:
        data = util.data_from_request()
        entry = blueprint.mongo.create_new_gate(group, name, data)
        return Response(json.dumps(entry), status=200, mimetype='application/json')
    except (
            NotMasterError, ServiceAlreadyExists, ServiceNameNotValid, JsonValidationError,
            JsonStructureError) as error:
        return error_response(error)


@blueprint.route('/api/gates/<string:group>/<string:name>', methods=['GET'])
@blueprint.route('/api/gates/<string:group>/<string:name>/<string:environment>', methods=['GET'])
def api_get_gate(group, name, environment=None):
    try:
        entry = blueprint.mongo.get_gate(group, name)
        if environment and environment not in entry['environments']:
            raise EnvironmentNotFound

        for env, info in entry['environments'].iteritems():
            if check_gate(entry, env):
                entry['environments'][env]['state'] = "closed"

        if environment:
            entry = entry['environments'][environment]
        return Response(json.dumps(entry), status=200, mimetype='application/json')
    except (NotFound, EnvironmentNotFound) as error:
        return error_response(error)


@blueprint.route('/api/gates/<string:group>/<string:name>', methods=['PUT'])
@blueprint.route('/api/gates/<string:group>/<string:name>/<string:environment>', methods=['PUT'])
def api_update_gate(group, name, environment=None):
    try:
        data = util.data_from_request()
        entry = blueprint.mongo.get_gate(group, name)

        if environment:
            if "state" in data:
                blueprint.mongo.set_gate(group, name, environment, data["state"])
            if "message" in data:
                blueprint.mongo.set_message(group, name, environment, data["message"])
        else:
            if "group" in data:
                entry["group"] = data["group"]
                blueprint.mongo.update_gate(group, name, entry)
            if "name" in data:
                entry["name"] = data["name"]
                blueprint.mongo.update_gate(group, name, entry)
                name = data["name"]
            if "environments" in data:
                if type(data['environments']) is list:
                    entry["environments"] = blueprint.mongo.get_environment_structure(data["environments"])
                    blueprint.mongo.update_gate(group, name, entry)
                else:
                    for env in data["environments"]:
                        if "state" in data["environments"][env]:
                            blueprint.mongo.set_gate(group, name, env, data["environments"][env]["state"])
                        if "message" in data["environments"][env]:
                            blueprint.mongo.set_message(group, name, env, data["environments"][env]["message"])
        entry = blueprint.mongo.get_gate(group, name)
        return Response(json.dumps(entry), status=200, mimetype='application/json')
    except (NotMasterError, ServiceNameNotValid, NotFound, GateStateNotValid, EnvironmentNotFound,
            JsonValidationError,
            JsonStructureError) as error:
        return error_response(error)


@blueprint.route('/api/gates/<string:name>', methods=['DELETE'])
@blueprint.route('/api/gates/<string:group>/<string:name>', methods=['DELETE'])
def api_remove_gate(group, name):
    try:
        blueprint.mongo.remove_gate(group, name)
        return Response('{"status": "ok"}', status=200, mimetype='application/json')
    except(NotFound, NotMasterError) as error:
        return error_response(error)


@blueprint.route('/api/tickets/<string:ticket_id>', methods=['DELETE'])
def api_release(ticket_id):
    try:
        blueprint.mongo.remove_ticket(ticket_id)
        return Response('{"status": "ok"}', status=200, mimetype='application/json')
    except (NotMasterError, ServiceAlreadyExists, ServiceNameNotValid, JsonValidationError, JsonStructureError,
            TicketNotFound) as error:
        return error_response(error)


def check_gate(entry, env, ticket_id=None):
    return env not in entry['environments'] or \
           entry['environments'][env]['state'] == 'closed' or \
           queue_is_blocked(entry['environments'][env]['queue'], ticket_id) or \
           (env in blueprint.config and not util.are_manual_settings_observed(blueprint.config, env))


def queue_is_blocked(queue, ticket_id=None):
    if not queue or queue[0]["id"] == ticket_id:
        return False
    return True


def error_response(exception):
    return Response('{"status": "error", "reason": "' + exception.message + '"}',
                    status=exception.status_code if getattr(exception, 'status_code', None) else 400,
                    mimetype='application/json')
