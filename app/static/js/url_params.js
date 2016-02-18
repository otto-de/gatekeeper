window.o_p13n = window.o_p13n || {};
window.o_p13n.tools = window.o_p13n.tools || {};

o_p13n.tools.url_params = function () {
    "use strict";
    var module = {};

    module.currentLocation = {
        getSearch: function () {
            return window.location.search;
        },
        setSearch: function (search) {
            window.location.search = search;
        },
        setState: function (url) {
            window.history.pushState({}, "", window.location.pathname + "" + url);
        }
    };

    var setUrlParameter = function (key, value, reload) {
        key = encodeURI(key);
        value = encodeURI(value);

        // get old params
        var term_list = module.currentLocation.getSearch().substr(1).split('&');

        var params = {};
        if (term_list != "") {
            for (var i in term_list) {
                var pair = term_list[i].split('=');
                if (pair.length === 2) {
                    params[pair[0]] = pair[1].split(',')
                }
            }
        }

        params[key] = value;

        var new_search = [];
        for (var param in  params) {
            if (params[param].length != 0) {
                var val = params[param];
                new_search.push([param, val].join('='))
            }
        }
        new_search = new_search.join('&');

        if (reload) {
            module.currentLocation.setSearch(new_search);
        } else {
            new_search = new_search ? "?" + new_search : "";
            module.currentLocation.setState(new_search);
        }
    };

    var manageStyleChange = function () {
        $('#style_change').click(function () {
                setUrlParameter("style", $(this).data("style"), true);
            }
        );
    };

    var changeUrlOnTabClick = function () {
        $('.tab-title').each(function () {
            var $this = $(this);
            var group = $this.data("group");
            $this.click(function () {
                setUrlParameter("tab", group, false);
            });
        });
    };

    module.init = function () {
        manageStyleChange();
        changeUrlOnTabClick();
    };

    return module

};

$(window).load(function () {
    o_p13n.tools.url_params().init();
});

