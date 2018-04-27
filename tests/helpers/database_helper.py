from app.mongo_connect import MongoConnect
from eliza.config import ConfigLoader
from datetime import datetime, timedelta
from app import state

class DatabaseHelper:
    def __init__(self, environment):
        config_loader = ConfigLoader(verify=False)
        self.config = config_loader.load_config("resources/", environment)
        self.mongo = MongoConnect(self.config)
        state.mongo = self.mongo

    def decrease_ticket_expiration_date_by(self, ticket_id, delta):
        self.mongo.update_ticket(ticket_id, {"expiration_date": self.mongo.get_expiration_date(delta)})

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
