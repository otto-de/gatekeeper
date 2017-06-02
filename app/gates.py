import time
from app import util
from app import state


def generate_info(config):
    info_list = []
    for env, rule_set in config.items():
        if not are_gates_open(config, env):
            info_list.append(
                env + ' Gates are closed for api calls because there isn\'t any rule for this time to enable manual settings.')
    return info_list


def test_against_global_rules(rules, env, lt):
    blocking_rules = set()
    unblocking_rules = set()
    if env in rules:
        for k, v in rules[env].items():
            hours = v['hours_range']
            days = v['days_range']
            if util.is_unblocked_by_rule(lt, hours, days):
                unblocking_rules.add(k)
            else:
                blocking_rules.add(k)
        return unblocking_rules, blocking_rules
    return set(), set()


def are_gates_open(config, env):
    rules = config
    localtime = time.localtime(time.time())
    return (not state.mongo.get_today_holiday(env)) and \
           bool(test_against_global_rules(rules, env, localtime)[0])


def gate_is_closed(entry, config, env, ticket_id=None):
    return gate_is_manually_closed(entry, env) or \
           not are_gates_open(config, env)


def gate_is_manually_closed(entry, env):
    return entry['environments'][env]['state'] == 'closed'
