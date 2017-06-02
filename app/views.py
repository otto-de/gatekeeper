from collections import OrderedDict
from delorean import Delorean
from delorean import parse
from flask import Blueprint, render_template

from app import util
from app import view_util
from app import gates
from app.errors import ConnectionFailure
from app.errors import OperationFailure

blueprint = Blueprint('views', __name__, template_folder='templates')


@blueprint.route('/')
@blueprint.route('/index')
@blueprint.route('/gates')
@blueprint.route('/gates/')
def get_gates():
    try:
        service_list = OrderedDict()
        env_list = dict()
        now = Delorean.now()
        today_holiday = blueprint.mongo.get_today_holiday()
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

                    service['environments'][env]['api_closed'] = gates.gate_is_closed(service, blueprint.config, env)

                    for t in service['environments'][env]["queue"]:
                        t["age"] = (now - (now - parse(t["updated"]))).humanize()

                    service_list[group][service_name] = service

            env_list[group] = sorted(env_list[group])

        return view_util.render("gates.html",
                                'Gates',
                                env_list=env_list,
                                gate_list=service_list,
                                info_list=gates.generate_info(blueprint.config),
                                today_holiday=today_holiday)
    except (ConnectionFailure, OperationFailure, Exception) as error:
        print("error" + str(error))
        raise
        # return view_util.error_page(error.message)


@blueprint.route('/gates/new')
@blueprint.route('/gates/new/')
def new_gate():
    return render_template("new_gate_overlay.html")


@blueprint.route('/holidays/edit')
@blueprint.route('/holidays/edit/')
def edit_holidays():
    holidays = list()
    for holiday in blueprint.mongo.get_future_holidays():
        holidays.append({
            'date': util.from_iso_date_string(holiday["date"]),
            'reason': holiday["reason"],
            'is_develop': is_environment("develop", holiday),
            'is_live': is_environment("live", holiday)
        })
    return render_template("edit_holidays_overlay.html",
                           holidays=holidays)


def is_environment(environment, holiday):
    return ("environments" in holiday) and (environment in holiday["environments"])


def error_page(error):
    return view_util.render("error.html",
                            "Error",
                            error=error)
