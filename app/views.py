from flask import Blueprint, render_template
from collections import OrderedDict
from delorean import Delorean
from delorean import parse

import view_util
from api import check_gate
import util
from errors import OperationFailure
from errors import ConnectionFailure

blueprint = Blueprint('views', __name__, template_folder='templates')


@blueprint.route('/')
@blueprint.route('/index')
@blueprint.route('/gates')
@blueprint.route('/gates/')
def gates():
    try:
        gate_list = OrderedDict()
        group_list = sorted(blueprint.mongo.get_groups())
        for group in group_list:
            gate_list[group] = sorted(blueprint.mongo.get_gates(group), key=lambda k: k['name'])

        env_list = dict()
        now = Delorean.now()
        for group, gates in gate_list.iteritems():
            env_list[group] = set()
            for gate in gates:
                for env in gate['environments']:
                    env_list[group].add(env)
                    if gate['environments'][env]['state_timestamp']:
                        gate['environments'][env]['state_age'] = (now - (now - parse(gate['environments'][env]['state_timestamp']))).humanize()
                    if gate['environments'][env]['message_timestamp']:
                        gate['environments'][env]['message_age'] = (
                        now - (now - parse(gate['environments'][env]['message_timestamp']))).humanize()
                    gate['environments'][env]['api_closed'] = check_gate(gate, env)
                    for t in gate['environments'][env]["queue"]:
                        t["age"] = (now - (now - parse(t["updated"]))).humanize()
            env_list[group] = sorted(env_list[group])
        return view_util.render("gates.html",
                                'Gates',
                                env_list=env_list,
                                gate_list=gate_list,
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
