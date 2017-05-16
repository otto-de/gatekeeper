import sys
import unittest
import uuid

from delorean import Delorean
from mock import mock, MagicMock

from app import config
from app import views


class MongoMock:
    @staticmethod
    def get_future_holidays():
        return [{'date': '2037-06-05',
                 'reason': 'Bergfest',
                 'environments': ['live']}]

class MongoMockWithTwoHolidays:
    @staticmethod
    def get_future_holidays():
        return [{'date': '2020-12-25',
                 'reason': 'Talfest',
                 'environments': ['develop', 'live']},
                {'date': '2037-06-05',
                 'reason': 'Bergfest',
                 'environments': ['develop']}]


class TestViews(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.maxDiff = None

    @mock.patch('flask.templating.render_template')
    def test_view_edit_holidays_calls_mock(self, template_mock):
        views.blueprint.mongo = MongoMock()
        views.render_template = template_mock
        views.edit_holidays()
        self.assertEqual(1, len(template_mock.mock_calls))

    @mock.patch('flask.templating.render_template')
    def test_view_edit_holidays_calls_renders_bergfest(self, template_mock):
        views.blueprint.mongo = MongoMock()
        views.render_template = template_mock
        views.edit_holidays()

        args, kwargs = template_mock.call_args
        holidays = kwargs['holidays']
        self.assertEqual(1, len(holidays))
        firstHoliday = holidays[0]
        self.assertEqual('05.06.2037', firstHoliday['date'])
        self.assertEqual('Bergfest', firstHoliday['reason'])
        self.assertEqual(False, firstHoliday['is_develop'])
        self.assertEqual(True, firstHoliday['is_live'])


    @mock.patch('flask.templating.render_template')
    def test_view_edit_holidays_calls_renders_two_holidays(self, template_mock):
        views.blueprint.mongo = MongoMockWithTwoHolidays()
        views.render_template = template_mock
        views.edit_holidays()

        args, kwargs = template_mock.call_args
        holidays = kwargs['holidays']
        self.assertEqual(2, len(holidays))
        firstHoliday = holidays[0]
        self.assertEqual('25.12.2020', firstHoliday['date'])
        self.assertEqual('Talfest', firstHoliday['reason'])
        self.assertEqual(True, firstHoliday['is_develop'])
        self.assertEqual(True, firstHoliday['is_live'])
        secondHoliday = holidays[1]
        self.assertEqual('05.06.2037', secondHoliday['date'])
        self.assertEqual('Bergfest', secondHoliday['reason'])
        self.assertEqual(True, secondHoliday['is_develop'])
        self.assertEqual(False, secondHoliday['is_live'])


if __name__ == '__main__':
    if len(sys.argv) > 1:
        environment = sys.argv.pop()
    else:
        environment = 'local'
    unittest.main()

if (__name__ == 'test_views') or (__name__ == 'tests.test_views'):
    environment = 'test'
