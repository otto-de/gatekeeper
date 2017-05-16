from app.mongo_connect import MongoConnect
from app.app import load_config
from datetime import datetime, timedelta


class DatabaseHelper:
    def __init__(self, environment):
        self.config = load_config(environment)

    def decrease_ticket_expiration_date_by(self, ticket_id, delta):
        mongo = MongoConnect(self.config)
        mongo.update_ticket(ticket_id, {"expiration_date": mongo.get_expiration_date(delta)})

    def create_holiday(self, days_offset, reason, environments):
        mongo = MongoConnect(self.config)
        mongo.add_holiday({
            'date': (datetime.now() + timedelta(days=days_offset)).strftime('%Y-%m-%d'),
            'reason': reason,
            'environments': environments
        })

    def clear_database(self):
        mongo = MongoConnect(self.config)
        mongo.collection.drop()
        mongo.tickets.drop()
        mongo.holidays.drop()
