import sys
import unittest
import uuid

from app import config
from app.errors import EnvironmentNotFound, NotFound, ServiceAlreadyExists, ServiceNameNotValid, NotFound, \
    GateStateNotValid, JsonStructureError, TicketNotFound
from app.util import get_by_list
from delorean import Delorean
from helpers.api_helper import ApiHelper
from helpers.database_helper import DatabaseHelper
from helpers.testdata_helper import TestDataHelper
from mock import mock


class TestApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.maxDiff = None

        cls.gateAlreadyExists = ServiceAlreadyExists().message
        cls.notFound = NotFound().message
        cls.gateNameNotValid = ServiceNameNotValid().message
        cls.gateStateNotValid = GateStateNotValid().message
        cls.environmentNotFound = EnvironmentNotFound().message
        cls.ticketNotFound = TicketNotFound().message
        cls.jsonStructureError = JsonStructureError().message

        cls.api_helper = ApiHelper(environment) # TODO fix environment?
        cls.database_helper = DatabaseHelper(environment) # TODO fix environment?
        cls.testdata_helper = TestDataHelper(cls.api_helper)

        cls.keys_develop_state = ['environments', 'develop', 'state']

    @classmethod
    def setUp(cls):
        config.CURRENT_TICKET_LIFETIME = 1
        cls.an_hour_from_now = Delorean.now().epoch + 3600000

    @classmethod
    def tearDown(cls):
        cls.database_helper.clear_database()

    def test_api_service_page_is_available(self):
        response = self.api_helper.get_html('/index')
        self.assertEqual(response.status_code, 200)

    def test_api_create_new_gate(self):
        second_env = 'env' + str(uuid.uuid4())
        service = self.testdata_helper.create_service_name()
        group = self.testdata_helper.create_group_name()
        gate_data = {
            'environments': ['develop', second_env]
        }

        response = self.api_helper.create_gate(group, service, gate_data)
        self.assertEqual(response['name'], service)
        self.assertEqual(response['group'], group)

        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertIn('state_timestamp', response['environments']['develop'])
        self.assertIn('message', response['environments']['develop'])
        self.assertIn('message_timestamp', response['environments']['develop'])

        self.assertEqual(response['environments'][second_env]['state'], 'open')
        self.assertIn('state_timestamp', response['environments'][second_env])
        self.assertIn('message', response['environments'][second_env])
        self.assertIn('message_timestamp', response['environments'][second_env])

    def test_api_create_and_remove_new_gate(self):
        service, group = self.testdata_helper.create_default_gate()
        response = self.api_helper.get_gate(group, service)

        self.assertNotIn('status', response)

        response = self.api_helper.remove_gate(group, service)
        self.assertEqual(response['status'], 'ok')

        response = self.api_helper.get_gate(group, service)
        self.assertIn('status', response)
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.notFound)

    def test_api_get_gate(self):
        service, group = self.testdata_helper.create_default_gate()
        response = self.api_helper.get_gate(group, service)

        self.assertEqual(response['name'], service)
        self.assertEqual(response['group'], group)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertIn('state_timestamp', response['environments']['develop'])
        self.assertIn('message', response['environments']['develop'])
        self.assertIn('message_timestamp', response['environments']['develop'])
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertIn('state_timestamp', response['environments']['develop'])
        self.assertIn('message', response['environments']['develop'])
        self.assertIn('message_timestamp', response['environments']['develop'])

    def test_api_get_non_existent_group(self):
        response = self.api_helper.get_gate('some-sufauigdoghfdoh', 'dfguisdhuighruifh')
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.notFound)

    def test_api_get_non_existent_service(self):
        service, group = self.testdata_helper.create_default_gate()

        response = self.api_helper.get_gate(group, 'dfguisdhuighruifh')
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.notFound)

    def test_api_error_with_new_gate_name_duplication(self):
        service, group = self.testdata_helper.create_default_gate()

        existing_gate_data = {
            'environments': ['develop']
        }
        response = self.api_helper.create_gate(group, service, existing_gate_data)

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateAlreadyExists)

    def test_api_create_new_gate_with_same_name_in_different_groups(self):
        service, group = self.testdata_helper.create_default_gate()

        new_group = self.testdata_helper.create_group_name()
        existing_gate_data = {
            'environments': ['develop']
        }
        response = self.api_helper.create_gate(new_group, service, existing_gate_data)

        self.assertEqual(response['name'], service)
        self.assertEqual(response['group'], new_group)


    def test_api_create_empty_gate(self):
        gate_data = {
            'environments': []
        }

        response = self.api_helper.create_gate(self.testdata_helper.create_group_name(),
                                               self.testdata_helper.create_service_name(), gate_data)
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.jsonStructureError + "Invalid environments.")

    def test_api_switch_and_check_gate(self):
        service, group = self.testdata_helper.create_default_gate()

        response = self.api_helper.open_gate(group, service, 'develop')
        self.assertEqual(get_by_list(response, self.keys_develop_state), 'open')

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(get_by_list(response, self.keys_develop_state), 'open')
        self.assertNotEqual('', get_by_list(response, ['environments', 'develop', 'state_timestamp']))

        response = self.api_helper.close_gate(group, service, 'develop')
        self.assertEqual(get_by_list(response, self.keys_develop_state), 'closed')

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(get_by_list(response, self.keys_develop_state), 'closed')

    def test_api_test_and_set_gate(self):
        service, group, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(response['environments']['develop']['state'], 'closed')
        self.assertEqual(len(response['environments']['develop']['queue']), 1)
        self.assertEqual(response['environments']['develop']['queue'][0]["id"], ticket_id)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

    def test_api_test_and_set_gate_then_query_with_valid_id(self):
        service, group, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        set_data["ticket"] = ticket_id
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertEqual(response['ticket']["id"], ticket_id)

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(response['environments']['develop']['state'], 'closed')
        self.assertEqual(response['environments']['develop']['queue'][0]["id"], ticket_id)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

    def test_api_test_and_set_gate_multiple_on_same_gate(self):
        service, group, set_data = self.testdata_helper.prepare_test_and_set_data()
        set_data = {
            "gates": {
                group: {
                    service: ['develop', 'live']
                }
            }
        }

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(response['environments']['develop']['state'], 'closed')
        self.assertEqual(response['environments']['develop']['queue'][0]["id"], ticket_id)
        self.assertEqual(response['environments']['live']['state'], 'closed')
        self.assertEqual(response['environments']['live']['queue'][0]["id"], ticket_id)

    def test_api_test_and_set_gate_closed(self):
        service, group, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.close_gate(group, service, 'develop')
        self.assertEqual(get_by_list(response, ['environments', 'develop', 'state']), 'closed')

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], "denied")

    def test_api_test_and_set_gate_multiple(self):
        service, group = self.testdata_helper.create_default_gate()
        another_service, another_group = self.testdata_helper.create_default_gate()

        set_data = {
            "gates": {
                group: {
                    service: ['develop']
                },
                another_group: {
                    another_service: ['live']
                }
            }
        }
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(response['environments']['develop']['state'], 'closed')
        self.assertEqual(response['environments']['develop']['queue'][0]["id"], ticket_id)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

        response = self.api_helper.get_gate(another_group, another_service)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(len(response['environments']['develop']['queue']), 0)
        self.assertEqual(response['environments']['live']['state'], 'closed')
        self.assertEqual(response['environments']['live']['queue'][0]["id"], ticket_id)

    def test_api_test_and_set_gate_multiple_one_closed(self):
        service, group = self.testdata_helper.create_default_gate()
        another_service, another_group = self.testdata_helper.create_default_gate()

        response = self.api_helper.close_gate(another_group, another_service, 'live')
        self.assertEqual(get_by_list(response, ['environments', 'live', 'state']), 'closed')

        set_data = {
            "gates": {
                group: {
                    service: ['develop']
                },
                another_group: {
                    another_service: ['live']
                }
            }
        }
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], "denied", response)

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(response['environments']['live']['state'], 'open')

        response = self.api_helper.get_gate(another_group, another_service)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(response['environments']['live']['state'], 'closed')

    @mock.patch('app.api.blueprint.mongo.get_expiration_date')
    def test_api_test_and_set_gate_then_release_max_lifetime_0(self, mongo_mock):
        config.CURRENT_TICKET_LIFETIME = 0
        mongo_mock.return_value = self.an_hour_from_now

        service, group, _ = self.testdata_helper.prepare_test_and_set_data()
        another_service, another_group, _ = self.testdata_helper.prepare_test_and_set_data()

        set_data = {
            "gates": {
                group: {
                    service: ['develop']
                },
                another_group: {
                    another_service: ['live']
                }
            }
        }
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        self.assertEqual(response['ticket']["expiration_date"], 0)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.delete_ticket(ticket_id)
        self.assertEqual(response['status'], 'ok')

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(len(response['environments']['develop']['queue']), 0)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

        response = self.api_helper.get_gate(another_group, another_service)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(len(response['environments']['develop']['queue']), 0)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

    @mock.patch('app.api.blueprint.mongo.get_expiration_date')
    def test_api_test_and_set_gate_then_release_with_max_lifetime_1(self, mongo_mock):
        mongo_mock.return_value = self.an_hour_from_now

        service, group, set_data = self.testdata_helper.prepare_test_and_set_data()
        another_service, another_group, _ = self.testdata_helper.prepare_test_and_set_data()

        set_data = {
            "gates": {
                group: {
                    service: ['develop']
                },
                another_group: {
                    another_service: ['live']
                }
            }
        }
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        self.assertEqual(response['ticket']["expiration_date"], self.an_hour_from_now)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.delete_ticket(ticket_id)
        self.assertEqual(response['status'], 'ok')

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(len(response['environments']['develop']['queue']), 0)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

        response = self.api_helper.get_gate(another_group, another_service)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(len(response['environments']['develop']['queue']), 0)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

    def test_api_test_and_set_gate_remove_then_release(self):
        service, group, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.remove_gate(group, service)
        self.assertEqual(response['status'], 'ok')

        response = self.api_helper.delete_ticket(ticket_id)
        self.assertEqual(response['status'], 'ok')

    def test_api_test_and_set_gate_release_then_try_to_validate(self):
        service, _, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.delete_ticket(ticket_id)
        self.assertEqual(response['status'], 'ok')

        set_data["ticket"] = ticket_id
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.ticketNotFound)

    def test_api_test_and_set_gate_try_to_validate_expired_ticket(self):
        service, _, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        self.database_helper.decrease_ticket_expiration_date_by(ticket_id, -2)

        set_data["ticket"] = ticket_id
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.ticketNotFound)

    def test_api_test_and_set_gate_queue_query_with_ids(self):
        service, group, set_data = self.testdata_helper.prepare_test_and_set_data()
        set_data_copy = set_data.copy()

        response = self.api_helper.set_gate_or_queue_ticket(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertIn('ticket', response)
        ticket_id_1 = response['ticket']["id"]

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(len(response['environments']['develop']['queue']), 1)

        response = self.api_helper.set_gate_or_queue_ticket(set_data)
        self.assertEqual(response['status'], 'queued')
        self.assertIn('ticket', response)
        ticket_id_2 = response['ticket']["id"]

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(len(response['environments']['develop']['queue']), 2)

        set_data["ticket"] = ticket_id_1
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(len(response['environments']['develop']['queue']), 2)

        set_data_copy["ticket"] = ticket_id_2
        response = self.api_helper.set_gate(set_data_copy)
        self.assertEqual(response['status'], 'denied')

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(len(response['environments']['develop']['queue']), 2)

    def test_api_test_and_set_gate_queue_with_expired_tickets(self):
        service, group, set_data = self.testdata_helper.prepare_test_and_set_data()
        set_data_copy = set_data.copy()

        response = self.api_helper.set_gate_or_queue_ticket(set_data)

        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        ticket_id_1 = response['ticket']["id"]

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(len(response['environments']['develop']['queue']), 1)

        response = self.api_helper.set_gate_or_queue_ticket(set_data)
        self.assertEqual(response['status'], 'queued', response)
        self.assertIn('ticket', response)
        ticket_id_2 = response['ticket']["id"]

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(len(response['environments']['develop']['queue']), 2)

        set_data["ticket"] = ticket_id_1
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertEqual(response['ticket']["id"], ticket_id_1)

        set_data_copy["ticket"] = ticket_id_2
        response = self.api_helper.set_gate(set_data_copy)
        self.assertEqual(response['status'], 'denied')

        # ticket 1 has been expired
        self.database_helper.decrease_ticket_expiration_date_by(ticket_id_1, -2)

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.ticketNotFound)

        response = self.api_helper.set_gate(set_data_copy)
        self.assertEqual(response['status'], 'ok')
        self.assertEqual(response['ticket']["id"], ticket_id_2)

    def test_api_test_and_set_release_non_existing_ticket_no_error(self):
        response = self.api_helper.delete_ticket('zzzzZZZzzzZZzzZzzZZzz')
        self.assertEqual(response['status'], 'ok')

    def test_api_test_and_set_validate_non_existing_ticket(self):
        service, group, set_data = self.testdata_helper.prepare_test_and_set_data()
        set_data["ticket"] = "zzzzZZZzzzZZzzZzzZZzz"

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.ticketNotFound)

    def test_api_test_and_set_gate_remove_env_then_release(self):
        service, group, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        ticket = response['ticket']["id"]

        response = self.api_helper.remove_gate(group, service)
        self.assertEqual(response['status'], 'ok')

        self.testdata_helper.create_default_gate_with(group, service, ['live'])

        response = self.api_helper.delete_ticket(ticket)
        self.assertEqual(response['status'], 'ok')

    @mock.patch('app.api.blueprint.mongo.get_expiration_date')
    def test_api_test_and_set_queue_in(self, mongo_mock):
        mongo_mock.return_value = self.an_hour_from_now

        service, group, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        self.assertEqual(response['ticket']["expiration_date"], self.an_hour_from_now)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.set_gate_or_queue_ticket(set_data)
        self.assertEqual(response['status'], 'queued')
        self.assertEqual(response['ticket']["expiration_date"], self.an_hour_from_now)
        ticket_id_2 = response['ticket']["id"]

        response = self.api_helper.get_gate(group, service)
        self.assertEqual(response['environments']['develop']['state'], 'closed')
        self.assertEqual(len(response['environments']['develop']['queue']), 2)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

        set_data2 = set_data.copy()
        set_data2["ticket"] = ticket_id_2
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'denied')

        response = self.api_helper.delete_ticket(ticket_id)
        self.assertEqual(response['status'], 'ok')

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'denied')

        response = self.api_helper.set_gate(set_data2)
        self.assertEqual(response['status'], 'ok', response)
        self.assertEqual(response['ticket']["expiration_date"], self.an_hour_from_now)

    def test_api_switch_non_existing_group(self):
        service, group = self.testdata_helper.create_default_gate()
        response = self.api_helper.open_gate('zzzzzZZZZZzzzZZZ', service, 'develop')

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.notFound)

    def test_api_switch_non_existing_service(self):
        _, group = self.testdata_helper.create_default_gate()
        response = self.api_helper.open_gate(group, 'zzzzzZZZZZzzzZZZ', 'develop')

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.notFound)

    def test_api_check_non_existing_group(self):
        service, _ = self.testdata_helper.create_default_gate()
        response = self.api_helper.get_gate('zzzzzZZZZZzzzZZZ', service)

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.notFound)

    def test_api_check_non_existing_service(self):
        _, group = self.testdata_helper.create_default_gate()
        response = self.api_helper.get_gate(group, 'zzzzzZZZZZzzzZZZ')

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.notFound)

    def test_api_check_invalid_service_name(self):
        service = 'zzz.zzz'
        group = 'some-test-group'
        data = {
            'environments': ['develop', 'live']
        }

        response = self.api_helper.create_gate(group, service, data)

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateNameNotValid)

    def test_api_check_invalid_gate_state(self):
        service, group = self.testdata_helper.create_default_gate()

        response = self.api_helper.set_state(group, service, 'develop', 'zzzZZZzzz')

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateStateNotValid)

    def test_api_check_invalid_environment(self):
        service, group = self.testdata_helper.create_default_gate()

        response = self.api_helper.open_gate(group, service, 'zzzZZZzzz')

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.environmentNotFound)

    def test_api_update_gate_name(self):
        service, group = self.testdata_helper.create_default_gate()

        original = self.api_helper.get_gate(group, service)
        self.api_helper.update_gate(group, service, {"name": "total_original_test_name"})
        updated = self.api_helper.get_gate(group, "total_original_test_name")

        self.assertNotEqual(original["name"], updated["name"])
        original.pop("name")
        updated.pop("name")
        self.assertDictEqual(original, updated)

    def test_api_update_gate_massage(self):
        service, group = self.testdata_helper.create_default_gate()

        message = "total_original_test_message"

        original = self.api_helper.get_gate(group, service)
        self.api_helper.update_gate(group, service, {"environments": {"live": {"message": message}}})
        updated = self.api_helper.get_gate(group, service)

        self.assertEqual(get_by_list(updated, ["environments", "live", "message"]), message)
        original["environments"]["live"]["message"] = ""
        original["environments"]["live"]["message_timestamp"] = ""
        updated["environments"]["live"]["message"] = ""
        updated["environments"]["live"]["message_timestamp"] = ""
        self.assertDictEqual(original, updated)

    def test_api_update_multiple_fields(self):
        service, group = self.testdata_helper.create_default_gate()

        message = "total_original_test_message"

        original = self.api_helper.get_gate(group, service)
        self.api_helper.update_gate(group, service,
                                    {"environments": {"develop": {"state": "closed"}, "live": {"message": message}}})
        updated = self.api_helper.get_gate(group, service)

        self.assertEqual(get_by_list(updated, ["environments", "live", "message"]), message)
        self.assertEqual(get_by_list(updated, ["environments", "develop", "state"]), "closed")
        original["environments"]["live"]["message"] = ""
        original["environments"]["live"]["message_timestamp"] = ""
        original["environments"]["develop"]["state"] = ""
        updated["environments"]["live"]["message"] = ""
        updated["environments"]["live"]["message_timestamp"] = ""
        updated["environments"]["develop"]["state"] = ""
        self.assertDictEqual(original, updated)

    def test_api_set_message(self):
        service, group = self.testdata_helper.create_default_gate()

        message = "Gate closed because of some testing"
        response = self.api_helper.set_message(group, service, message)
        self.assertEqual(response['environments']['develop']['message'], message)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertNotEqual(response['environments']['live']['message'], message)
        self.assertEqual(response['environments']['live']['state'], 'open')

    def test_api_set_message_non_existent_group(self):
        response = self.api_helper.set_message('some-goup', 'some-service', "This is an impediment")

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.notFound)

    def test_api_set_message_non_existent_service(self):
        service, group = self.testdata_helper.create_default_gate()
        response = self.api_helper.set_message(group, 'sdgduhguiduigdh', "This is an impediment")

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.notFound)

    def test_api_set_message_non_existent_environment(self):
        service, group = self.testdata_helper.create_default_gate()

        message = "This is an impediment"
        response = self.api_helper.set_message_on(group, service, message, 'dgoshdhgiurhfui')

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.environmentNotFound)

    def test_api_delete_message(self):
        service, group = self.testdata_helper.create_default_gate()

        response = self.api_helper.set_message(group, service, "")
        self.assertEqual(response['environments']['develop']['message'], '')
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(response['environments']['live']['message'], '')
        self.assertEqual(response['environments']['live']['state'], 'open')

    def test_api_set_note_non_existing_gate(self):
        message = "This is an impediment"

        response = self.api_helper.set_message("group", "nonExistingGate", message)

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.notFound)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        environment = sys.argv.pop()
    else:
        environment = 'local'
    unittest.main()

if (__name__ == 'test_api') or (__name__ == 'tests.test_api'):
    environment = 'local'
