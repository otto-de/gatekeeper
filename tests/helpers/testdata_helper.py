import uuid

class TestDataHelper:

    def __init__(self, api_helper):
        self.api_helper = api_helper

    def prepare_test_and_set_data(self):
        gate_name = self.createDefaultGate()

        set_data = {
            "services": {
                gate_name: ['develop']
            }
        }

        return gate_name, set_data

    def createGateName(self):
        return 'test-gate' + str(uuid.uuid4())

    def createDefaultGate(self):
        gate_name = self.createGateName()
        self.createDefaultGateWith(gate_name, ['develop', 'live'])
        return gate_name

    def createDefaultGateWith(self, gate_name, environments):
        gate_data = {
            'name': gate_name,
            'group': 'dog',
            'environments': environments
        }
        return self.api_helper.create_gate(gate_name, gate_data)

