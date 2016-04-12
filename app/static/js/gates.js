window.o_p13n = window.o_p13n || {};
window.o_p13n.tools = window.o_p13n.tools || {};

o_p13n.tools.gates = function () {
    "use strict";
    var module = {};

    module.createAlertBox = function (errorMsg) {
        return "<div class=\"alert alert-dismissible alert-danger\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">×</button><strong>" + errorMsg + "</strong></div>";
    };

    var toggleGateButton = function ($button) {
        var action = $button.attr("action");
        if (action == "open") {
            $button.attr({"action": "closed", "class": "btn btn-success"});
            $button.text("Open");
        } else {
            $button.attr({"action": "open", "class": "btn btn-danger", "text": "Closed"});
            $button.text("Closed");
        }
        var $timestamp = $button.parent().find(".timestamp").first()
        $timestamp.text("now");
    };

    module.toggleGate = function ($button) {
        var data = {
            "state": $button.attr("action")
        };
        $.ajax({
            type: "PUT",
            url: "/api/gates/" + $button.data("gate-group") + "/" + $button.data("gate-name") + "/" + $button.data("gate-environment"),
            contentType: 'application/json',
            data: JSON.stringify(data),
            timeout: 5000,
            success: function (response) {
                toggleGateButton($button);
            },
            error: function (response) {
                $("#alert_box").html(module.createAlertBox(response.responseJSON.reason));
            }
        });
    };

    module.remove_ticket = function ($button) {
        $.ajax({
            type: "DELETE",
            url: "/api/tickets/" + $button.data("ticket-id"),
            dataType: 'json',
            timeout: 5000,
            success: function (response) { //TODO for each for every ticket with this id
                $button.parent().remove();
            },
            error: function (response) {
                $("#alert_box").html(module.createAlertBox(response.responseJSON.reason));
            }
        })
    };

    var initTextarea = function () {
        $('.js_gate_textarea').each(function () {
            var i;
            var t;
            var has_changed = false;
            var offset = this.offsetHeight - this.clientHeight;
            var resizeTextarea = function (el) {
                jQuery(el).css('height', 'auto').css('height', el.scrollHeight + offset);
            };
            resizeTextarea(this);

            jQuery(this).on('keyup input', function () {
                has_changed = true;
                resizeTextarea(this);
            }).removeAttr('data-autoresize');

            var save = function (el) {
                var data = {
                    "message": "" + el.value
                };
                if (has_changed) {
                    has_changed = false;
                    $.ajax({
                        type: "PUT",
                        url: "/api/gates/" + el.getAttribute("data-gate-group") + "/" + el.getAttribute("data-gate-name") + "/" + el.getAttribute("data-gate-environment"),
                        contentType: 'application/json',
                        timeout: 5000,
                        data: JSON.stringify(data),
                        success: function (response) {
                            var t = $("#" + el.getAttribute("data-gate-group") + "-" + el.getAttribute("data-gate-name") + "-" + el.getAttribute("data-gate-environment") + "-message-timestamp")
                            t.text("now");
                        },
                        error: function (response) {
                            has_changed = true;
                            $("#alert_box").html(module.createAlertBox(response.responseJSON.reason));
                        }
                    });
                }
            };

            jQuery(this).focus(function () {
                t = this;
                i = setInterval(function () {
                    save(t)
                }, 1000)
            });
            jQuery(this).focusout(function () {
                clearInterval(i);
                save(this);
            });
        });
    };

    var initToggleGateButtons = function () {
        $('.js_gate_button').each(function () {
            var $this = $(this);
            $this.click(function () {
                module.toggleGate($this);
            });
        });
    };

    var initRemoveButtons = function() {
        $('.js_remove_button').each(function () {
            var $this = $(this);
            $this.click(function () {
                module.remove_ticket($this);
            });
        });
    }

    var initNewGateOverlay = function () {
        $("#open_new_gate_overlay").onclick = function () {
            colorbox();
        };
    };

    var disableColorboxCloseButton = function () {
        $(document).ready(function () {
            $(".ajax").colorbox({closeButton: false});
        });
    };


    module.init = function () {
        initToggleGateButtons();
        initRemoveButtons();
        initNewGateOverlay();
        initTextarea();
        disableColorboxCloseButton();
    };

    return module
};

$(window).load(function () {
    o_p13n.tools.gates().init();
});
