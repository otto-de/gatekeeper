import json
from flask import Flask
from delorean import Delorean

from app import views
from app import api
from app import status
from app import view_util
from app import state
from eliza.config import ConfigLoader
from app.mongo_connect import MongoConnect

navigation_bar = [('views.get_gates', 'Gates')]
app_name = "Gatekeeper"


def create_app(environment, port):
    flask = Flask(__name__)
    flask.config.from_pyfile('config.py')

    config_loader = ConfigLoader(use_vault=False, verify=False)
    info = config_loader.load_application_info("./")
    config = config_loader.load_config("resources/", environment)

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
