window.o_p13n = window.o_p13n || {};
window.o_p13n.tools = window.o_p13n.tools || {};

o_p13n.tools.edit_holidays_overlay = function () {
    "use strict";
    var module = {};

    var addHoliday = function () {
        $('#holiday_item_template > div').clone(true, true).appendTo("#holidays_list");
    };

    var addHolidayButton = function () {
        document.getElementById('add_holiday').onclick = addHoliday;
    };


    var initNewGateButton = function () {
        document.getElementById('save_holidays').onclick = function () {
            var data = {
                "holidays": []
            };
            var all_holidays_okay = true;
            $('#holidays_list .holiday_entry').each(function () {
                var _cur = this;

                function is_active(env) {
                    return $(_cur).find(".holiday_is_" + env).is(".active");
                }

                function showErrorMessage(testResult, errorMessageClass) {
                    if (testResult) {
                        $(_cur).find(errorMessageClass).show();
                        all_holidays_okay = false;
                    } else {
                        $(_cur).find(errorMessageClass).hide();
                    }
                }

                var holiday_date = $(this).find(".holiday_date").val();
                var holiday_reason = $(this).find(".holiday_reason").val();

                if (holiday_date || holiday_reason) {
                    showErrorMessage(!holiday_date.match(/\d\d.\d\d.\d\d\d\d/), ".holiday_dateformat_missing");
                    showErrorMessage(!holiday_reason.match(/\S/), ".holiday_reason_missing");
                    showErrorMessage(!is_active('develop') && !is_active('live'), ".holiday_evironment_missing");
                }

                var environments = [];
                ['live', 'develop'].forEach(function (env) {
                    if (is_active(env)) {
                        environments.push(env);
                    }
                });
                var date_matcher = holiday_date.match(/(\d\d).(\d\d).(\d\d\d\d)/);
                if (date_matcher) {
                    var iso_date = date_matcher[3] + "-" + date_matcher[2] + "-" + date_matcher[1];
                    data['holidays'].push({
                        'date': iso_date,
                        'reason': holiday_reason,
                        'environments': environments
                    });
                }

            });
            if (all_holidays_okay) {
                $.ajax({
                    type: "POST",
                    url: "/api/holidays/",
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
            }
        };
    };

    var removeHolidayButton = function () {
        $(".remove_holiday").click(function () {
            $(this).parent().parent().remove();
            if (!$('#holidays_list').is(':has("div")')) {
                addHoliday();
            }
        });
    };

    module.init = function () {
        initNewGateButton();
        addHolidayButton();
        removeHolidayButton();
    };

    return module
}
;

o_p13n.tools.edit_holidays_overlay().init();
