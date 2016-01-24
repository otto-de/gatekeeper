import views
import api
import status
import view_util

from flask import Flask
from mongo_connect import MongoConnect
import json
import time

navigation_bar = [('views.gates', 'Gates')]
app_name = "Gatekeeper"


def create_app(environment):
    flask = Flask(__name__)
    flask.config.from_pyfile('config.py')

    config = load_config(environment)
    with open('version-info.json', 'r') as configFile:
        version = json.loads(configFile.read())

    view_util.navigation_bar = navigation_bar
    view_util.app_name = version['name']

    status.blueprint.navigation_bar = navigation_bar
    status.blueprint.app_name = app_name
    status.blueprint.version = version
    status.blueprint.start_time = time.strftime('%d-%m-%Y %H:%M', time.localtime(time.time()))
    flask.add_url_rule('/' + version['name'] + '/internal/health', view_func=status.status_health)
    flask.add_url_rule('/' + version['name'] + '/internal/status', view_func=status.status_page)

    mongo = MongoConnect(config)

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