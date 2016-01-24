import json
import time
import socket
import view_util
from flask import Response, render_template, request, jsonify, Blueprint, g

blueprint = Blueprint('status', __name__)


def status_health():
    dic = {
        "status": "ok"
    }
    js = json.dumps(dic)
    resp = Response(js, status=200, mimetype='text/plain')
    return resp


def status_page():
    status = generate_status()
    if view_util.request_wants_json():
        return Response(json.dumps(status), status=200, mimetype=view_util.request_wants_json())
    return render_template("status_page.html",
                           status=status)


def generate_status():
    return {
        "application": {
            "status": "OK",
            "name": blueprint.version['name'],
            "hostname": socket.gethostname(),
            "systemtime": get_timestamp(),
            "systemstarttime": blueprint.start_time,
            "commit": blueprint.version['commit'],
            "version": blueprint.version['version'],
            "statusDetails": {
            }
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


def get_timestamp():
    return time.strftime('%d-%m-%Y %H:%M', time.localtime(time.time()))
