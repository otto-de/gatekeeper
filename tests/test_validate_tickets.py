import unittest
import uuid
import sys

from app import api
from delorean import Delorean
from datetime import timedelta
from app.app import create_app


class TestValidateTickets(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        create_app(environment=environment, port=8080)

    def create_ticket(self, expiration_date):
        return {"id": str(uuid.uuid4()),
                  "updated": Delorean.now().format_datetime(format='y-MM-dd HH:mm:ssz'),
                  "expiration_date": expiration_date,
                  "link": None}

    def test_validate_tickets(self):
        queue = []
        for i in range(5):
            expiration_date = Delorean.now()
            expiration_date += timedelta(hours=1)
            queue.append(self.create_ticket(expiration_date.epoch))
        self.assertEqual(api.queue_is_blocked(queue), True)

    def test_validate_tickets_that_not_expire(self):
        queue = []
        for i in range(5):
            queue.append(self.create_ticket(0))
        self.assertEqual(api.queue_is_blocked(queue), True)

    def test_validate_tickets_one_expired(self):
        queue = []
        for i in range(5):
            expiration_date = Delorean.now()
            expiration_date += timedelta(hours=1)
            queue.append(self.create_ticket(expiration_date.epoch))

        expiration_date = Delorean.now()
        expiration_date += timedelta(hours=-5)
        queue.append(self.create_ticket(expiration_date.epoch))
        self.assertEqual(api.queue_is_blocked(queue), True)

    def test_validate_tickets_all_but_one_expired(self):
        queue = []
        for i in range(5):
            expiration_date = Delorean.now()
            expiration_date += timedelta(hours=-1)
            queue.append(self.create_ticket(expiration_date.epoch))

        expiration_date = Delorean.now()
        expiration_date += timedelta(hours=1)
        queue.append(self.create_ticket(expiration_date.epoch))
        self.assertEqual(api.queue_is_blocked(queue), True)

    def test_validate_tickets_all_expired(self):
        queue = []
        for i in range(5):
            expiration_date = Delorean.now()
            expiration_date += timedelta(hours=-1)
            queue.append(self.create_ticket(expiration_date.epoch))
        self.assertEqual(api.queue_is_blocked(queue), False)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        environment = sys.argv.pop()
    else:
        environment = 'local'
    unittest.main()

if (__name__ == 'test_validate_tickets') or (__name__ == 'tests.test_validate_tickets'):
    environment = 'local'