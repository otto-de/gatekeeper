from collections import OrderedDict

import util
import view_util
from api import gate_is_closed
from delorean import Delorean
from delorean import parse
from errors import ConnectionFailure
from errors import OperationFailure
from flask import Blueprint, render_template

blueprint = Blueprint('views', __name__, template_folder='templates')


@blueprint.route('/')
@blueprint.route('/index')
@blueprint.route('/gates')
@blueprint.route('/gates/')
def gates():
    try:
        service_list = OrderedDict()
        env_list = dict()
        now = Delorean.now()
        for group in blueprint.mongo.get_groups():
            env_list[group] = set()
            service_list[group] = dict()

            for service_name in blueprint.mongo.get_services_in_group(group):
                service = blueprint.mongo.get_gate(group, service_name)

                for env in service['environments']:
                    env_list[group].add(env)
                    if service['environments'][env]['state_timestamp']:
                        service['environments'][env]['state_age'] = (
                            now - (now - parse(service['environments'][env]['state_timestamp']))).humanize()
                    if service['environments'][env]['message_timestamp']:
                        service['environments'][env]['message_age'] = (
                            now - (now - parse(service['environments'][env]['message_timestamp']))).humanize()

                    service['environments'][env]['api_closed'] = gate_is_closed(service, env)

                    for t in service['environments'][env]["queue"]:
                        t["age"] = (now - (now - parse(t["updated"]))).humanize()

                    service_list[group][service_name] = service

            env_list[group] = sorted(env_list[group])

        return view_util.render("gates.html",
                                'Gates',
                                env_list=env_list,
                                gate_list=service_list,
                                info_list=util.generate_info(blueprint.config))
    except (ConnectionFailure, OperationFailure) as error:
        return view_util.error_page(error.message)


@blueprint.route('/gates/new')
@blueprint.route('/gates/new/')
def new_gate():
    return render_template("new_gate_overlay.html")


def error_page(error):
    return view_util.render("error.html",
                            "Error",
                            error=error)
