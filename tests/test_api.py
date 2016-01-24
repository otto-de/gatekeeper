import sys
import unittest
import uuid

from app.errors import EnvironmentNotFound
from app.errors import GateAlreadyExists
from app.errors import GateNameNotValid
from app.errors import GateNotFound
from app.errors import GateStateNotValid
from app.errors import TicketNotFound
from app.errors import JsonStructureError
from app.util import get_by_list


from helpers.api_helper import ApiHelper
from helpers.database_helper import DatabaseHelper
from helpers.testdata_helper import TestDataHelper


class TestApi(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.maxDiff = None

        cls.gateAlreadyExists = GateAlreadyExists().message
        cls.gateNotFound = GateNotFound().message
        cls.gateNameNotValid = GateNameNotValid().message
        cls.gateStateNotValid = GateStateNotValid().message
        cls.environmentNotFound = EnvironmentNotFound().message
        cls.ticketNotFound = TicketNotFound().message
        cls.jsonStructureError = JsonStructureError().message

        cls.api_helper = ApiHelper(environment)
        cls.database_helper = DatabaseHelper(environment)
        cls.testdata_helper = TestDataHelper(cls.api_helper)

        cls.keys_develop_state = ['environments', 'develop', 'state']

    @classmethod
    def tearDown(cls):
        cls.database_helper.clearDatabase()

    def test_api_service_page_is_available(self):
        response = self.api_helper.get_html('/index')
        self.assertEqual(response.status_code, 200)

    def test_api_create_new_gate(self):
        second_env = 'env' + str(uuid.uuid4())
        gate_name = self.testdata_helper.createGateName()
        gate_data = {
            'group': 'group' + str(uuid.uuid4()),
            'environments': ['develop', second_env]
        }

        response = self.api_helper.create_gate(gate_name, gate_data)

        self.assertEqual(response['name'], gate_name)
        self.assertEqual(response['group'], gate_data['group'])

        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertIn('state_timestamp', response['environments']['develop'])
        self.assertIn('message', response['environments']['develop'])
        self.assertIn('message_timestamp', response['environments']['develop'])

        self.assertEqual(response['environments'][second_env]['state'], 'open')
        self.assertIn('state_timestamp', response['environments'][second_env])
        self.assertIn('message', response['environments'][second_env])
        self.assertIn('message_timestamp', response['environments'][second_env])

    def test_api_create_and_remove_new_gate(self):
        gate_name = self.testdata_helper.createDefaultGate()
        response = self.api_helper.get_gate(gate_name)

        self.assertNotIn('status', response)

        response = self.api_helper.remove_gate(gate_name)
        self.assertEqual(response['status'], 'ok')

        response = self.api_helper.get_gate(gate_name)
        self.assertIn('status', response)
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateNotFound)

    def test_api_get_gate(self):
        gate_name = self.testdata_helper.createDefaultGate()

        response = self.api_helper.get_gate(gate_name)

        self.assertEqual(response['name'], gate_name)
        self.assertEqual(response['group'], 'dog')
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertIn('state_timestamp', response['environments']['develop'])
        self.assertIn('message', response['environments']['develop'])
        self.assertIn('message_timestamp', response['environments']['develop'])
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertIn('state_timestamp', response['environments']['develop'])
        self.assertIn('message', response['environments']['develop'])
        self.assertIn('message_timestamp', response['environments']['develop'])

    def test_api_get_non_existent_gate(self):
        response = self.api_helper.get_gate('dfguisdhuighruifh')
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateNotFound)

    def test_api_create_new_gate_with_duplicate_name(self):
        existing_gate_name = self.testdata_helper.createDefaultGate()

        existing_gate_data = {
            'name': existing_gate_name,
            'group': 'dog',
            'environments': ['develop']
        }
        response = self.api_helper.create_gate(existing_gate_name, existing_gate_data)

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateAlreadyExists)

    def test_api_create_empty_gate(self):
        gate_data = {
            'group': '',
            'environments': []
        }

        response = self.api_helper.create_gate(self.testdata_helper.createGateName(), gate_data)
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.jsonStructureError + "Invalid group.")

    def test_api_switch_and_check_gate(self):
        gate_name = self.testdata_helper.createDefaultGate()

        response = self.api_helper.open_gate(gate_name, 'develop')
        self.assertEqual(get_by_list(response, self.keys_develop_state), 'open')

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(get_by_list(response, self.keys_develop_state), 'open')
        self.assertNotEqual('', get_by_list(response, ['environments', 'develop', 'state_timestamp']))

        response = self.api_helper.close_gate(gate_name, 'develop')
        self.assertEqual(get_by_list(response, self.keys_develop_state), 'closed')

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(get_by_list(response, self.keys_develop_state), 'closed')

    def test_api_test_and_set_gate(self):
        gate_name, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(response['environments']['develop']['state'], 'closed')
        self.assertEqual(len(response['environments']['develop']['queue']), 1)
        self.assertEqual(response['environments']['develop']['queue'][0]["id"], ticket_id)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

    def test_api_test_and_set_gate_then_query_with_valid_id(self):
        gate_name, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        set_data["ticket"] = ticket_id
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertEqual(response['ticket']["id"], ticket_id)

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(response['environments']['develop']['state'], 'closed')
        self.assertEqual(response['environments']['develop']['queue'][0]["id"], ticket_id)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

    def test_api_test_and_set_gate_multiple_on_same_gate(self):
        gate_name, _ = self.testdata_helper.prepare_test_and_set_data()
        set_data = {
            "services": {
                gate_name: ['develop', 'live']
            }
        }

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(response['environments']['develop']['state'], 'closed')
        self.assertEqual(response['environments']['develop']['queue'][0]["id"], ticket_id)
        self.assertEqual(response['environments']['live']['state'], 'closed')
        self.assertEqual(response['environments']['live']['queue'][0]["id"], ticket_id)

    def test_api_test_and_set_gate_closed(self):
        gate_name, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.close_gate(gate_name, 'develop')
        self.assertEqual(get_by_list(response, ['environments', 'develop', 'state']), 'closed')

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], "denied")

    def test_api_test_and_set_gate_multiple(self):
        gate_name = self.testdata_helper.createDefaultGate()
        another_gate_name = self.testdata_helper.createDefaultGate()

        set_data = {
            "services": {
                gate_name: ['develop'],
                another_gate_name: ['live']
            }
        }
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(response['environments']['develop']['state'], 'closed')
        self.assertEqual(response['environments']['develop']['queue'][0]["id"], ticket_id)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

        response = self.api_helper.get_gate(another_gate_name)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(len(response['environments']['develop']['queue']), 0)
        self.assertEqual(response['environments']['live']['state'], 'closed')
        self.assertEqual(response['environments']['live']['queue'][0]["id"], ticket_id)

    def test_api_test_and_set_gate_multiple_one_closed(self):
        gate_name = self.testdata_helper.createDefaultGate()
        another_gate_name = self.testdata_helper.createDefaultGate()

        response = self.api_helper.close_gate(another_gate_name, 'live')
        self.assertEqual(get_by_list(response, ['environments', 'live', 'state']), 'closed')

        set_data = {
            "services": {
                gate_name: ['develop'],
                another_gate_name: ['live']
            }
        }
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], "denied", response)

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(response['environments']['live']['state'], 'open')

        response = self.api_helper.get_gate(another_gate_name)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(response['environments']['live']['state'], 'closed')

    def test_api_test_and_set_gate_then_release(self):
        gate_name, _ = self.testdata_helper.prepare_test_and_set_data()
        gate_name2, _ = self.testdata_helper.prepare_test_and_set_data()

        set_data = {
            "services": {
                gate_name: ['develop'],
                gate_name2: ['live']
            }
        }
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        self.assertEqual(response['ticket']["expiration_date"], 0)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.delete_ticket(ticket_id)
        self.assertEqual(response['status'], 'ok')

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(len(response['environments']['develop']['queue']), 0)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

        response = self.api_helper.get_gate(gate_name2)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(len(response['environments']['develop']['queue']), 0)
        self.assertEqual(response['environments']['live']['state'], 'open')
        self.assertEqual(len(response['environments']['live']['queue']), 0)

    def test_api_test_and_set_gate_remove_then_release(self):
        gate_name, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.remove_gate(gate_name)
        self.assertEqual(response['status'], 'ok')

        response = self.api_helper.delete_ticket(ticket_id)
        self.assertEqual(response['status'], 'ok')

    def test_api_test_and_set_gate_release_then_try_to_validate(self):
        gate_name, set_data = self.testdata_helper.prepare_test_and_set_data()

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
        gate_name, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertIn('ticket', response)
        ticket_id = response['ticket']["id"]

        self.database_helper.decreaseTicketExpirationDateBy(ticket_id, -2)

        set_data["ticket"] = ticket_id
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.ticketNotFound)

    def test_api_test_and_set_gate_queue_query_with_ids(self):
        gate_name, set_data = self.testdata_helper.prepare_test_and_set_data()
        set_data2 = set_data.copy()

        response = self.api_helper.set_gate_or_queue_ticket(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertIn('ticket', response)
        ticket_id_1 = response['ticket']["id"]

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(len(response['environments']['develop']['queue']), 1)

        response = self.api_helper.set_gate_or_queue_ticket(set_data)
        self.assertEqual(response['status'], 'queued')
        self.assertIn('ticket', response)
        ticket_id_2 = response['ticket']["id"]

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(len(response['environments']['develop']['queue']), 2)

        set_data["ticket"] = ticket_id_1
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(len(response['environments']['develop']['queue']), 2)

        set_data2["ticket"] = ticket_id_2
        response = self.api_helper.set_gate(set_data2)
        self.assertEqual(response['status'], 'denied')

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(len(response['environments']['develop']['queue']), 2)

    def test_api_test_and_set_gate_queue_with_expired_tickets(self):
        gate_name, set_data = self.testdata_helper.prepare_test_and_set_data()
        set_data2 = set_data.copy()

        response = self.api_helper.set_gate_or_queue_ticket(set_data)

        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        ticket_id_1 = response['ticket']["id"]

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(len(response['environments']['develop']['queue']), 1)

        response = self.api_helper.set_gate_or_queue_ticket(set_data)
        self.assertEqual(response['status'], 'queued', response)
        self.assertIn('ticket', response)
        ticket_id_2 = response['ticket']["id"]

        response = self.api_helper.get_gate(gate_name)
        self.assertEqual(len(response['environments']['develop']['queue']), 2)

        set_data["ticket"] = ticket_id_1
        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertEqual(response['ticket']["id"], ticket_id_1)

        set_data2["ticket"] = ticket_id_2
        response = self.api_helper.set_gate(set_data2)
        self.assertEqual(response['status'], 'denied')

        # ticket 1 has been expired
        self.database_helper.decreaseTicketExpirationDateBy(ticket_id_1, -2)

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.ticketNotFound)

        response = self.api_helper.set_gate(set_data2)
        self.assertEqual(response['status'], 'ok')
        self.assertEqual(response['ticket']["id"], ticket_id_2)

    def test_api_test_and_set_release_non_existing_ticket_no_error(self):
        response = self.api_helper.delete_ticket('zzzzZZZzzzZZzzZzzZZzz')
        self.assertEqual(response['status'], 'ok')

    def test_api_test_and_set_validate_non_existing_ticket(self):
        gate_name, set_data = self.testdata_helper.prepare_test_and_set_data()
        set_data["ticket"] = "zzzzZZZzzzZZzzZzzZZzz"

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.ticketNotFound)

    def test_api_test_and_set_gate_remove_env_then_release(self):
        gate_name, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok', response)
        self.assertIn('ticket', response)
        ticket = response['ticket']["id"]

        response = self.api_helper.remove_gate(gate_name)
        self.assertEqual(response['status'], 'ok')

        self.testdata_helper.createDefaultGateWith(gate_name, ['live'])

        response = self.api_helper.delete_ticket(ticket)
        self.assertEqual(response['status'], 'ok')

    def test_api_test_and_set_queue_in(self):
        gate_name, set_data = self.testdata_helper.prepare_test_and_set_data()

        response = self.api_helper.set_gate(set_data)
        self.assertEqual(response['status'], 'ok')
        self.assertIn('ticket', response)
        self.assertEqual(response['ticket']["expiration_date"], 0)
        ticket_id = response['ticket']["id"]

        response = self.api_helper.set_gate_or_queue_ticket(set_data)
        self.assertEqual(response['status'], 'queued', response)
        self.assertGreater(response['ticket']["expiration_date"], 0)
        ticket_id_2 = response['ticket']["id"]

        response = self.api_helper.get_gate(gate_name)
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
        self.assertEqual(response['ticket']["expiration_date"], 0, response)

    def test_api_switch_non_existing_gate(self):
        gate_name = 'zzzzzZZZZZzzzZZZ'

        response = self.api_helper.open_gate(gate_name, 'develop')

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateNotFound)

    def test_api_check_non_existing_gate(self):
        gate_name = 'zzzzzZZZZZzzzZZZ'

        response = self.api_helper.get_gate(gate_name)

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateNotFound)

    def test_api_check_invalid_gate_name(self):
        gate_name = 'zzz.zzz'
        gate_data = {
            'name': gate_name,
            'group': 'dog',
            'environments': ['develop', 'live']
        }

        response = self.api_helper.create_gate(gate_name, gate_data)

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateNameNotValid)

    def test_api_check_invalid_gate_state(self):
        gate_name = self.testdata_helper.createDefaultGate()

        response = self.api_helper.set_state(gate_name, 'develop', 'zzzZZZzzz')

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateStateNotValid)

    def test_api_check_invalid_environment(self):
        gate_name = self.testdata_helper.createDefaultGate()

        response = self.api_helper.open_gate(gate_name, 'zzzZZZzzz')

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.environmentNotFound)

    def test_api_update_gate_name(self):
        gate_name = self.testdata_helper.createDefaultGate()

        original = self.api_helper.get_gate(gate_name)
        response = self.api_helper.update_gate(gate_name, {"name": "total_original_test_name"})
        updated = self.api_helper.get_gate("total_original_test_name")

        self.assertNotEqual(original["name"], updated["name"])
        original.pop("name")
        updated.pop("name")
        self.assertDictEqual(original, updated)

    def test_api_update_gate_massage(self):
        gate_name = self.testdata_helper.createDefaultGate()

        message = "total_original_test_message"

        original = self.api_helper.get_gate(gate_name)
        self.api_helper.update_gate(gate_name, {"environments": {"live": {"message": message}}})
        updated = self.api_helper.get_gate(gate_name)

        self.assertEqual(get_by_list(updated, ["environments", "live", "message"]), message)
        original["environments"]["live"]["message"] = ""
        original["environments"]["live"]["message_timestamp"] = ""
        updated["environments"]["live"]["message"] = ""
        updated["environments"]["live"]["message_timestamp"] = ""
        self.assertDictEqual(original, updated)

    def test_api_update_multiple_fields(self):
        gate_name = self.testdata_helper.createDefaultGate()

        message = "total_original_test_message"

        original = self.api_helper.get_gate(gate_name)
        self.api_helper.update_gate(gate_name, {"environments": {"develop": {"state": "closed"}, "live": {"message": message}}})
        updated = self.api_helper.get_gate(gate_name)

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
        gate_name = self.testdata_helper.createDefaultGate()

        message = "Gate closed because of some testing"
        response = self.api_helper.set_message(gate_name, message)
        self.assertEqual(response['environments']['develop']['message'], message)
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertNotEqual(response['environments']['live']['message'], message)
        self.assertEqual(response['environments']['live']['state'], 'open')

    def test_api_set_message_non_existent_gate(self):
        response = self.api_helper.set_message('sdgduhguiduigdh', "This is an impediment")

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateNotFound)

    def test_api_set_message_non_existent_environment(self):
        gate_name = self.testdata_helper.createDefaultGate()

        message = "This is an impediment"
        response = self.api_helper.set_message_on(gate_name, message, 'dgoshdhgiurhfui')

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.environmentNotFound)

    def test_api_delete_message(self):
        gate_name = self.testdata_helper.createDefaultGate()

        response = self.api_helper.set_message(gate_name, "")
        self.assertEqual(response['environments']['develop']['message'], '')
        self.assertEqual(response['environments']['develop']['state'], 'open')
        self.assertEqual(response['environments']['live']['message'], '')
        self.assertEqual(response['environments']['live']['state'], 'open')

    def test_api_set_note_non_existing_gate(self):
        message = "This is an impediment"

        response = self.api_helper.set_message("nonExistingGate", message)

        self.assertEqual(response['status'], 'error')
        self.assertEqual(response['reason'], self.gateNotFound)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        environment = sys.argv.pop()
    else:
        environment = 'local'
    unittest.main()

if (__name__ == 'test_api') or (__name__ == 'tests.test_api'):
    environment = 'local'
