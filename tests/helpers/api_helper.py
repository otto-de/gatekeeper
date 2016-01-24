import json

from app.app import create_app


class ApiHelper:
    def __init__(self, environment):
        print('Run tests on environment ' + environment)
        self.app = create_app(environment)
        self.app.config.update(
            DEBUG=True,
            SECRET_KEY='secret_key',
            WTF_CSRF_ENABLED=False
        )
        self.headers = [('Content-Type', 'text/plain')]
        self.content_json = [('Content-Type', 'application/json')]
        self.api = self.app.test_client()

    def create_gate(self, name, data):
        response = self.api.post('/api/services/' + name,
                                 headers=self.content_json,
                                 data=json.dumps(data))
        return json.loads(response.data)

    def update_gate(self, name, data):
        response = self.api.put('/api/services/' + name,
                                headers=self.content_json,
                                data=json.dumps(data))
        return json.loads(response.data)

    def remove_gate(self, name):
        return json.loads(self.api.delete('/api/services/' + name).data)

    def get_gate(self, name):
        return self.__get__('/api/services/' + name)

    def open_gate(self, name, environment):
        return self.set_state(name, environment, 'open')

    def close_gate(self, name, environment):
        return self.set_state(name, environment, 'closed')

    def set_state(self, name, environment, state):
        return json.loads(self.api.put('/api/services/' + name + '/' + environment,
                                       headers=self.headers,
                                       data=json.dumps({"state": state})).data)

    def set_message(self, gate_name, message):
        return self.set_message_on(gate_name, message, 'develop')

    def set_message_on(self, gate_name, message, environment):
        return json.loads(self.api.put('/api/services/' + gate_name + '/' + environment, headers=self.headers,
                                       data=json.dumps({"message": message})).data)

    def set_gate(self, data):
        return json.loads(self.api.put('/api/services',
                                       headers=self.content_json,
                                       data=json.dumps(data)).data)

    def set_gate_or_queue_ticket(self, data):
        return json.loads(self.api.put('/api/services?queue=true',
                                       headers=self.content_json,
                                       data=json.dumps(data)).data)

    def delete_ticket(self, ticket_id):
        return json.loads(self.api.delete('/api/tickets/' + ticket_id,
                                          headers=self.content_json).data)

    def get_html(self, page):
        return self.api.get(page, content_type='text/html')

    def __get__(self, query):
        return json.loads(self.api.get(query).data)
