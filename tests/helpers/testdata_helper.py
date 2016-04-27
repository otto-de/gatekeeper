import uuid


class TestDataHelper:
    def __init__(self, api_helper):
        self.api_helper = api_helper

    def prepare_test_and_set_data(self):
        service, group = self.create_default_gate()

        set_data = {
            "gates": {
                group: {
                    service: ['develop']
                }
            }
        }

        return service, group, set_data

    def prepare_legacy_test_and_set_data(self):
        service, group = self.create_default_gate()

        set_data = {
            "services": {
                service: ['develop']
            }
        }

        return service, group, set_data

    def create_service_name(self):
        return 'test-gate_' + str(uuid.uuid4())

    def create_group_name(self):
        return 'test-group_' + str(uuid.uuid4())

    def create_default_gate(self):
        service = self.create_service_name()
        group = self.create_group_name()
        self.create_default_gate_with(group, service, ['develop', 'live'])
        return service, group

    def create_default_gate_with(self, group, service, environments):
        gate_data = {
            'environments': environments
        }
        return self.api_helper.create_gate(group, service, gate_data)
