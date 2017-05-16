import views
import api
import status
import view_util
import state
from delorean import Delorean

from flask import Flask
from mongo_connect import MongoConnect
import json
import time

navigation_bar = [('views.get_gates', 'Gates')]
app_name = "Gatekeeper"


def create_app(environment, port):
    flask = Flask(__name__)
    flask.config.from_pyfile('config.py')

    config = load_config(environment)
    with open('info.json', 'r') as configFile:
        info = json.loads(configFile.read())

    view_util.navigation_bar = navigation_bar
    view_util.app_name = info['name']

    status.blueprint.navigation_bar = navigation_bar
    status.blueprint.info = info
    status.blueprint.environment = environment
    status.blueprint.port = port
    status.blueprint.start_time = Delorean.now()

    mongo = MongoConnect(config)
    state.mongo = mongo

    views.blueprint.mongo = mongo
    views.blueprint.config = config['app']
    api.blueprint.mongo = mongo
    api.blueprint.config = config['app']

    flask.register_blueprint(status.blueprint)
    flask.register_blueprint(views.blueprint)
    flask.register_blueprint(api.blueprint)
    return flask


def load_config(environment):
    with open('./resources/default.json', 'r') as configFile:
        config = json.loads(configFile.read())
    with open('./resources/' + environment + '.json', 'r') as configFile:
        env_config = json.loads(configFile.read())
    config.update(env_config)
    return config