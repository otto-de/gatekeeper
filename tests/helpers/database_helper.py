from app.mongo_connect import MongoConnect
from app.app import load_config

class DatabaseHelper:

    def __init__(self, environment):
        self.config = load_config(environment)

    def decreaseTicketExpirationDateBy(self, ticket_id, delta):
        mongo = MongoConnect(self.config)
        mongo.set_ticket_expiration_date(ticket_id, expiration_date=mongo.get_expiration_date(delta))

    def clearDatabase(self):
        mongo = MongoConnect(self.config)
        mongo.collection.drop()
        mongo.tickets.drop()