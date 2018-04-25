import json
import socket
from delorean import Delorean
from flask import Response, render_template, request, jsonify, Blueprint

from app import view_util

blueprint = Blueprint('status', __name__)

@blueprint.route("/internal/health")
def status_health():
    dic = {
        "status": "ok"
    }
    js = json.dumps(dic)
    resp = Response(js, status=200, mimetype='text/plain')
    return resp


@blueprint.route("/internal/status")
def status_page():
    status = generate_status()
    if view_util.request_wants_json():
        return Response(json.dumps(status), status=200, mimetype=view_util.request_wants_json())
    return render_template("status_page.html",
                           status=status)


@blueprint.route("/internal/status.json")
def status_page_json():
    status = generate_status()
    return Response(json.dumps(status), status=200, mimetype='application/json')


def generate_status():
    now = Delorean.now()
    uptime = (now - (now - blueprint.start_time)).humanize()

    return {
        "application": {
            "name": blueprint.info['name'],
            "description": blueprint.info['description'],
            "group": blueprint.info['group'],
            "environment": blueprint.environment,
            "version": blueprint.info['version'],
            "commit": blueprint.info['commit'],
            "vcs_link": blueprint.info['vcs_link'] + blueprint.info['commit'],
            "status": "OK",
            "statusDetails": {
            },
        },
        "system": {
            "hostname": socket.gethostname(),
            "port": blueprint.port,
            "systemtime": now.format_datetime(format=get_timestamp_format()),
            "systemstarttime": blueprint.start_time.format_datetime(format=get_timestamp_format()),
            "uptime": uptime
        },
        "team": {
            "team": blueprint.info['team'],
            "contact_technical": blueprint.info['contact_technical'],
            "contact_business": blueprint.info['contact_business']
        },
        "serviceSpecs": {

        }

    }


@blueprint.errorhandler(404)
def not_found(error=None):
    message = {
        'status': 404,
        'message': 'Not Found: ' + request.url,
    }
    resp = jsonify(message)
    resp.status_code = 404
    return resp


def get_timestamp_format():
    return 'dd-MM-YYYY H:m'
