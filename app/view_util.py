from flask import render_template, request

navigation_bar = None
app_name = None


def render(html, title, **kwargs):
    return render_template(html,
                           parameter=request.args,
                           url_query=get_url_query(),
                           navigation_bar=navigation_bar,
                           title=title,
                           app_name=app_name,
                           **kwargs)


def get_url_query():
    if request.query_string != '':
        return '?' + request.query_string
    else:
        return ''


def request_wants_json():
    for mime in request.accept_mimetypes:
        if 'json' in mime[0]:
            return mime[0]
    return False