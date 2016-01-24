import pymongo.errors


class ConnectionFailure(pymongo.errors.ConnectionFailure):
    def __init__(self, message):
        super(ConnectionFailure, self).__init__(message)
        self.message = "Can not connect to mongodb. Please check configuration"
        self.status_code = 500


class NotMasterError(pymongo.errors.NotMasterError):
    def __init__(self, message):
        super(NotMasterError, self).__init__(message)
        self.message = "Can not write to database. Please wait until reconnected to master or start with proper configuration"
        self.status_code = 500


class OperationFailure(pymongo.errors.OperationFailure):
    def __init__(self, message):
        super(OperationFailure, self).__init__(message)
        self.message = "Can not complete operation on database. This could be a authentication error"


class GateAlreadyExists(Exception):
    def __init__(self):
        self.message = "Gate with this name already exists"


class GateNotFound(Exception):
    def __init__(self):
        self.message = "Gate not found"
        self.status_code = 404


class TicketNotFound(Exception):
    def __init__(self):
        self.message = "Ticket does not exist"
        self.status_code = 404


class GateNameNotValid(Exception):
    def __init__(self):
        self.message = "Gate name not valid. Should not empty or contains dots"


class GateStateNotValid(Exception):
    def __init__(self):
        self.message = "state must be open or closed"


class EnvironmentNotFound(Exception):
    def __init__(self):
        self.message = "Environment not found"
        self.status_code = 404


class JsonValidationError(Exception):
    def __init__(self):
        self.message = "Json was not valid"


class JsonStructureError(Exception):
    def __init__(self, message=""):
        self.message = "Your json contains invalid information. " + message
