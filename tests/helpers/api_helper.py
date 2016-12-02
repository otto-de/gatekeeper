import json

from app.app import create_app


def load_json(data):
    try:
        return json.loads(data)
    except Exception as err:
        print(data)
        raise err


class ApiHelper:
    def __init__(self, environment):
        print('Run tests on environment ' + environment)
        self.app = create_app(environment=environment, port=8080)
        self.app.config.update(
            DEBUG=True,
            SECRET_KEY='secret_key',
            WTF_CSRF_ENABLED=False
        )
        self.headers = [('Content-Type', 'text/plain')]
        self.content_json = [('Content-Type', 'application/json')]
        self.api = self.app.test_client()

    def create_gate(self, group, name, data):
        response = self.api.post('/api/gates/' + group + "/" + name,
                                 headers=self.content_json,
                                 data=json.dumps(data))
        return load_json(response.data)

    def update_gate(self, group, name, data):
        response = self.api.put('/api/gates/' + group + "/" + name,
                                headers=self.content_json,
                                data=json.dumps(data))
        return load_json(response.data)

    def remove_gate(self, group, name):
        return load_json(self.api.delete('/api/gates/' + group + "/" + name).data)

    def get_gate(self, group, name):
        return self.__get__('/api/gates/' + group + "/" + name)

    def open_gate(self, group, service, environment):
        return self.set_state(group, service, environment, 'open')

    def close_gate(self, group, service, environment):
        return self.set_state(group, service, environment, 'closed')

    def set_state(self, group, service, environment, state):
        return load_json(self.api.put('/api/gates/' + group + "/" + service + '/' + environment,
                                      headers=self.headers,
                                      data=json.dumps({"state": state})).data)

    def set_message(self, group, service, message):
        return self.set_message_on(group, service, message, 'develop')

    def set_message_on(self, group, service, message, environment):
        return load_json(
            self.api.put('/api/gates/' + group + "/" + service + '/' + environment, headers=self.headers,
                         data=json.dumps({"message": message})).data)

    def set_gate(self, data):
        return load_json(self.api.put('/api/gates',
                                      headers=self.content_json,
                                      data=json.dumps(data)).data)

    def set_gate_or_queue_ticket(self, data):
        return load_json(self.api.put('/api/gates?queue=true',
                                      headers=self.content_json,
                                      data=json.dumps(data)).data)

    def delete_ticket(self, ticket_id):
        return load_json(self.api.delete('/api/tickets/' + ticket_id,
                                         headers=self.content_json).data)

    def get_html(self, page):
        return self.api.get(page, content_type='text/html')

    def __get__(self, query):
        return load_json(self.api.get(query).data)
