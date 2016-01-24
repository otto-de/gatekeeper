import time


def generate_info(config):
    info_list = []
    for env, rule_set in config.iteritems():
        if not are_manual_settings_observed(config, env):
            info_list.append(
                env + ' Gates are closed for api calls because there isn\'t any rule for this time to enable manual settings.')
    return info_list


def is_unblocked_by_rule(lt, h, d):
    return (d[0] <= lt[6] <= d[1] and \
            h[0] <= lt[3] < h[1])


def test_against_global_rules(rules, env, lt):
    blocking_rules = set()
    unblocking_rules = set()
    for k, v in rules[env].iteritems():
        hours = v['hours_range']
        days = v['days_range']
        if is_unblocked_by_rule(lt, hours, days):
            unblocking_rules.add(k)
        else:
            blocking_rules.add(k)
    return unblocking_rules, blocking_rules


def are_manual_settings_observed(config, env):
    rules = config
    localtime = time.localtime(time.time())
    return bool(test_against_global_rules(rules, env, localtime)[0])


def get_by_list(dic, keys):
    return reduce(dict.get, keys, dic)
