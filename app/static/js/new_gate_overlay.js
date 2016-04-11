window.o_p13n = window.o_p13n || {};
window.o_p13n.tools = window.o_p13n.tools || {};

o_p13n.tools.new_gate_overlay = function () {
    "use strict";
    var module = {};

    var initNewGateButton = function () {
        document.getElementById('save_gate').onclick = function () {
            var name = $("#name").val();
            var group = $("#group").val();
            var data = {
                "environments": $("#environments").val().split(',')
            };
            if (data["environments"].length == 1 && data["environments"][0] == "") {
                data["environments"] = ["develop", "live"]
            }
            $.ajax({
                type: "POST",
                url: "/api/gates/" + group + "/" + name,
                contentType: 'application/json',
                timeout: 5000,
                data: JSON.stringify(data),
                success: function (response) {
                    $.colorbox.close()
                },
                error: function (response) {
                    $("#new_gate_alert_box").html(window.o_p13n.tools.createAlertBox(response.responseJSON.reason));
                }
            });
        };
    };

    module.init = function () {
        initNewGateButton();
    };

    return module
};

o_p13n.tools.new_gate_overlay().init();
