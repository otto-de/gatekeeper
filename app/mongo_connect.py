import uuid
from pymongo import MongoClient
import pymongo.errors
from delorean import Delorean
from delorean import epoch
from datetime import timedelta
from errors import OperationFailure, GroupNameNotValid
from errors import ConnectionFailure
from errors import NotMasterError
from errors import ServiceNameNotValid
from errors import ServiceAlreadyExists
from errors import NotFound
from errors import TicketNotFound
from errors import GateStateNotValid
from errors import EnvironmentNotFound
from errors import JsonStructureError


class MongoConnect:
    def __init__(self, config):
        self.client = MongoClient(config['mongo']['uris'])
        self.db = self.client[config['mongo']['database']]
        self.collection = self.db['services']
        self.tickets = self.db['tickets']
        self.queue = self.db['queue']
        self.d = Delorean()
        self.d = self.d.shift('Europe/Amsterdam')

    def get_environment_structure(self, environment_list):
        data = dict()
        for env in environment_list:
            env = env.strip()
            data[env] = dict()
            data[env]['state'] = 'open'
            data[env]['state_timestamp'] = self.get_formatted_timestamp()
            data[env]['message'] = ''
            data[env]['message_timestamp'] = ''
            data[env]['queue'] = []
        return data

    def create_new_gate(self, group, name, request):
        if not name or '.' in name:
            raise ServiceNameNotValid
        if not group or '.' in group:
            raise GroupNameNotValid

        if self.check_existence(group, name):
            raise ServiceAlreadyExists

        if 'environments' not in request or not request['environments'] or '' in request['environments'] or type(
                request['environments']) != list:
            raise JsonStructureError("Invalid environments.")
        try:
            data = dict()
            data['_id'] = str(uuid.uuid4())
            data['document_version'] = 2.2
            data['name'] = name.strip()
            data['group'] = group.strip()
            data['environments'] = self.get_environment_structure(request['environments'])

            self.collection.insert_one(data)
            data.pop('_id')  # do not return _id  
            return data
        except pymongo.errors.NotMasterError as error:
            raise NotMasterError(error.message)

    def remove_gate(self, group, name):
        if not self.check_existence(group, name):
            raise NotFound
        try:
            self.collection.remove({"name": name, "group": group})
        except pymongo.errors.NotMasterError as error:
            raise NotMasterError(error.message)

    def update_gate(self, group, name, entry):
        try:
            self.collection.update({"name": name, "group": group}, {'$set': entry}, upsert=False)
        except pymongo.errors.ConnectionFailure as error:
            raise ConnectionFailure(error.message)
        except pymongo.errors.OperationFailure as error:
            raise OperationFailure(error.message)

    def get_gate(self, group, name):
        entry = self.check_existence(group, name)
        if not entry:
            raise NotFound
        for env, info in entry['environments'].iteritems():
            tickets = []
            for ticket_id in info['queue']:
                ticket = self.get_ticket(ticket_id)
                if ticket:
                    tickets.append(ticket)
                else:
                    self.remove_ticket_link(group, name, env, ticket_id)
            entry['environments'][env]['queue'] = tickets
        return entry

    def legacy_get_gate(self, name):
        entry = self.legacy_check_existence(name)
        if not entry:
            raise NotFound
        for env, info in entry['environments'].iteritems():
            tickets = []
            for ticket_id in info['queue']:
                ticket = self.get_ticket(ticket_id)
                if ticket:
                    tickets.append(ticket)
                else:
                    self.legacy_remove_ticket_link(name, env, ticket_id)
            entry['environments'][env]['queue'] = tickets
        return entry

    def set_gate(self, group, name, environment, state):
        entry = self.check_existence(group, name)
        self.validate_environment_state(entry, environment, state)
        try:
            current_state = entry['environments'][environment]['state']
            if current_state != state:
                entry['environments'][environment]['state'] = state
                entry['environments'][environment]['state_timestamp'] = self.get_formatted_timestamp()
                return self.collection.update({'name': name, 'group': group}, {'$set': entry}, upsert=False)
        except pymongo.errors.NotMasterError as error:
            raise NotMasterError(error.message)

    @staticmethod
    def get_expiration_date(minutes_delta):
        expiration_date = Delorean.now()
        expiration_date += timedelta(minutes=minutes_delta)
        return expiration_date.epoch

    def add_ticket_link(self, group, name, environment, ticket_id):
        self.collection.update({'name': name, 'group': group},
                               {'$push': {"environments." + environment + ".queue": ticket_id}})

    def legacy_add_ticket_link(self, name, environment, ticket_id):
        self.collection.update({'name': name},
                               {'$push': {"environments." + environment + ".queue": ticket_id}})

    def remove_ticket_link(self, group, name, environment, ticket_id):
        self.collection.update({'name': name, 'group': group},
                               {'$pull': {"environments." + environment + ".queue": ticket_id}})

    def legacy_remove_ticket_link(self, name, environment, ticket_id):
        self.collection.update({'name': name},
                               {'$pull': {"environments." + environment + ".queue": ticket_id}})

    def add_ticket(self, ticket_id, ticket):
        try:
            self.tickets.update({"_id": ticket_id}, ticket, upsert=True)
        except pymongo.errors.NotMasterError as error:
            raise NotMasterError(error.message)
        return ticket

    def get_ticket(self, ticket_id):
        ticket = self.tickets.find_one({"_id": ticket_id})
        now = Delorean.now().epoch
        if ticket and (ticket["expiration_date"] == 0 or ticket["expiration_date"] > now):
            return ticket
        else:
            self.remove_ticket(ticket_id)
        return None

    def remove_ticket(self, ticket_id):
        self.tickets.remove({"_id": ticket_id})

    def update_ticket(self, ticket_id, ticket):
        self.tickets.update({"_id": ticket_id}, {'$set': ticket}, upsert=False)

    @staticmethod
    def validate_environment_state(entry, environment, state):
        if not entry:
            raise NotFound
        if environment not in entry['environments']:
            raise EnvironmentNotFound
        if state not in ["open", "closed"]:
            raise GateStateNotValid

    def set_message(self, group, name, environment, message):
        entry = self.check_existence(group, name)
        if not entry:
            raise NotFound
        if environment not in entry['environments']:
            raise EnvironmentNotFound
        try:
            entry['environments'][environment]['message'] = message
            entry['environments'][environment]['message_timestamp'] = self.get_formatted_timestamp() if message else ""
            return self.collection.update({"name": name, "group": group}, {'$set': entry}, upsert=False)
        except pymongo.errors.NotMasterError as error:
            raise NotMasterError(error.message)

    def check_existence(self, group, name):
        return self.collection.find_one({"name": name, "group": group}, {'_id': False})

    def legacy_check_existence(self, name):
        return self.collection.find_one({"name": name}, {'_id': False})

    def get_groups(self):
        return self.collection.distinct('group')

    def get_services_in_group(self, group):
        return self.collection.find({'group': group}).distinct("name")

    def get_formatted_timestamp(self):
        return self.d.now().format_datetime(format='y-MM-dd HH:mm:ssz')
