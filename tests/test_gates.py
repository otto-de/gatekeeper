import sys
import unittest
import uuid

from delorean import Delorean
from mock import mock

from app import config
from app import gates
from app import state
from app import views
from app.app import load_config
from app.mongo_connect import MongoConnect
from helpers.database_helper import DatabaseHelper

test_rules = {
    "live": {
        "no_restriction": {
            "hours_range": [0, 24],
            "days_range": [0, 6]
        }
    },
    "develop": {
        "no_restriction": {
            "hours_range": [0, 24],
            "days_range": [0, 6]
        }
    }
}


class TestGates(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.maxDiff = None
        cls.database_helper = DatabaseHelper(environment)
        cls.database_helper.clear_database()
        state.mongo = MongoConnect(load_config(environment))

    @classmethod
    def tearDown(cls):
        cls.database_helper.clear_database()

    def test_are_gates_open_when_there_is_no_holiday_today(self):
        self.database_helper.create_holiday(1, 'Holidays are always tomorrow', ['live'])
        self.assertEqual(True, gates.are_gates_open(test_rules, 'live'))

    def test_are_gates_closed_on_live_but_open_on_develop(self):
        self.database_helper.create_holiday(0, 'Party time today', ['live'])
        self.assertEqual(False, gates.are_gates_open(test_rules, 'live'))
        self.assertEqual(True, gates.are_gates_open(test_rules, 'develop'))


if __name__ == '__main__':
    if len(sys.argv) > 1:
        environment = sys.argv.pop()
    else:
        environment = 'local'
    unittest.main()

if (__name__ == 'test_gates') or (__name__ == 'tests.test_gates'):
    environment = 'test'
