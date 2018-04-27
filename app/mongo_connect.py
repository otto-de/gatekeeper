import uuid
from pymongo import MongoClient
import pymongo.errors
from delorean import Delorean
from datetime import timedelta, datetime
from app.errors import OperationFailure, GroupNameNotValid
from app.errors import ConnectionFailure
from app.errors import NotMasterError
from app.errors import ServiceNameNotValid
from app.errors import ServiceAlreadyExists
from app.errors import NotFound
from app.errors import GateStateNotValid
from app.errors import EnvironmentNotFound
from app.errors import JsonStructureError


class MongoConnect:
    def __init__(self, config):
        self.client = MongoClient(self.build_uris(config))
        self.db = self.client[config['mongo']['database']]
        self.collection = self.db[config['mongo']['services_collection']]
        self.tickets = self.db[config['mongo']['tickets_collection']]
        self.holidays = self.db[config['mongo']['holidays_collection']]
        self.queue = self.db['queue']
        self.d = Delorean()
        self.d = self.d.shift('Europe/Amsterdam')

        self.check_connection()

    @staticmethod
    def build_uris(config):
        if config['mongo'].get('username') and config['mongo'].get('password'):
            uris = ','.join(config['mongo']['uris'])
            ssl = 'ssl=' + (str(config['mongo']['use_ssl']).lower() if config['mongo'].get('use_ssl') else 'false')
            authSource = ('&authSource=' + str(config['mongo']['authSource'])) if config['mongo'].get(
                'authSource') else ''
            replicaSet = ('&replicaSet=' + str(config['mongo']['replicaSet'])) if config['mongo'].get(
                'replicaSet') else ''
            mongoConnectionString = [
                'mongodb://' + config['mongo']['username'] + ':' + config['mongo']['password'] + '@' + uris + '/' +
                config['mongo']['database'] + '?' + ssl + replicaSet + authSource]
            return mongoConnectionString
        else:
            return config['mongo']['uris']

    def check_connection(self):
        try:
            self.client.server_info()
        except pymongo.errors.OperationFailure as error:
            raise OperationFailure(error.details)
        except pymongo.errors.ServerSelectionTimeoutError as error:
            raise ConnectionFailure(error.details)
        print("\n\x1b[32mDatabase connection up and running\x1b[0m")

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
            raise NotMasterError(error.details)

    def remove_gate(self, group, name):
        if not self.check_existence(group, name):
            raise NotFound
        try:
            self.collection.remove({"name": name, "group": group})
        except pymongo.errors.NotMasterError as error:
            raise NotMasterError(error.details)

    def update_gate(self, group, name, entry):
        try:
            self.collection.update({"name": name, "group": group}, {'$set': entry}, upsert=False)
        except pymongo.errors.ConnectionFailure:
            raise ConnectionFailure("Connection failure while gate update")
        except pymongo.errors.OperationFailure as error:
            raise OperationFailure(error.details)

    def get_gate(self, group, name):
        entry = self.check_existence(group, name)
        if not entry:
            raise NotFound
        for env, info in entry['environments'].items():
            tickets = []
            for ticket_id in info['queue']:
                ticket = self.get_ticket(ticket_id)
                if ticket:
                    tickets.append(ticket)
                else:
                    self.remove_ticket_link(group, name, env, ticket_id)
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
            raise NotMasterError(error.details)

    @staticmethod
    def get_expiration_date(minutes_delta):
        expiration_date = Delorean.now()
        expiration_date += timedelta(minutes=minutes_delta)
        return expiration_date.epoch

    def add_ticket_link(self, group, name, environment, ticket_id):
        self.collection.update({'name': name, 'group': group},
                               {'$push': {"environments." + environment + ".queue": ticket_id}})

    def remove_ticket_link(self, group, name, environment, ticket_id):
        self.collection.update({'name': name, 'group': group},
                               {'$pull': {"environments." + environment + ".queue": ticket_id}})

    def add_ticket(self, ticket_id, ticket):
        try:
            self.tickets.update({"_id": ticket_id}, ticket, upsert=True)
        except pymongo.errors.NotMasterError as error:
            raise NotMasterError(error.details)
        return ticket

    def get_ticket(self, ticket_id):
        ticket = self.tickets.find_one({"_id": ticket_id})
        now = Delorean.now().epoch
        if ticket and (ticket["expiration_date"] == 0 or ticket["expiration_date"] > now):
            ticket.pop('_id')
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
            raise EnvironmentNotFound(environment)
        if state not in ["open", "closed"]:
            raise GateStateNotValid

    def set_message(self, group, name, environment, message):
        entry = self.check_existence(group, name)
        if not entry:
            raise NotFound
        if environment not in entry['environments']:
            raise EnvironmentNotFound(environment)
        try:
            entry['environments'][environment]['message'] = message
            entry['environments'][environment]['message_timestamp'] = self.get_formatted_timestamp() if message else ""
            return self.collection.update({"name": name, "group": group}, {'$set': entry}, upsert=False)
        except pymongo.errors.NotMasterError as error:
            raise NotMasterError(error.details)

    def check_existence(self, group, name):
        return self.collection.find_one({"name": name, "group": group}, {'_id': False})

    def get_groups(self):
        return self.collection.distinct('group')

    def get_services_in_group(self, group):
        return self.collection.find({'group': group}).distinct("name")

    def get_formatted_timestamp(self):
        return self.d.now().format_datetime(format='y-MM-dd HH:mm:ssz')

    def get_future_holidays(self):
        find_params = {'date': {'$gte': self.today()}}
        return self.holidays.find(find_params).sort('date')

    def clear_holidays(self):
        self.holidays.delete_many({})

    def add_holiday(self, holiday):
        data = dict()
        data['_id'] = str(uuid.uuid4())
        data['date'] = holiday['date']
        data['reason'] = holiday['reason']
        data['environments'] = holiday['environments']
        self.holidays.insert_one(data)

    @staticmethod
    def today():
        return datetime.now().strftime("%Y-%m-%d")

    def get_today_holiday(self, env=None):
        return self.get_holiday_for(self.today(), env)

    def get_holiday_for(self, date, env=None):
        if env:
            holiday = self.holidays.find_one({'date': date,
                                              'environments': {'$in': [env]}})
        else:
            holiday = self.holidays.find_one({'date': date})
        return holiday["reason"] if holiday else None
