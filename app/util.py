import json
from datetime import datetime

from errors import JsonValidationError
from flask import request, Blueprint


def data_from_request():
    try:
        data = json.loads(request.data)
    except ValueError or TypeError:
        raise JsonValidationError()
    return data


def is_unblocked_by_rule(lt, h, d):
    return (d[0] <= lt[6] <= d[1] and \
            h[0] <= lt[3] < h[1])


def get_by_list(dic, keys):
    return reduce(dict.get, keys, dic)


def to_iso_date_string(date):
    return datetime.strptime(date, '%d.%m.%Y').strftime('%Y-%m-%d')


def from_iso_date_string(date):
    return datetime.strptime(date, '%Y-%m-%d').strftime('%d.%m.%Y')
