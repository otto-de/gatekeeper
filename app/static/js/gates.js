function createAlertBox(errorMsg) {
    return "<div class=\"alert alert-dismissible alert-danger\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">×</button><strong>" + errorMsg + "</strong></div>";
};

function toggleGateButton(id) {
    var e = $("#"+id)
    var action = e.attr("action");
    if (action == "open") {
        e.attr({"action":"closed", "class":"btn btn-success"});
        e.text("Open");
    } else {
        e.attr({"action":"open", "class":"btn btn-danger", "text": "Closed"});
        e.text("Closed");
    }
    var t = $("#"+id+"-button-timestamp")
    t.text("now");
};

function createOnClickHandler(id, gate_name, environment) {
    return function(){
        data = {
            "state": document.getElementById(id).getAttribute("action")
        }
        $.ajax({
            type: "PUT",
            url: "/api/services/"+gate_name+"/"+environment,
            contentType: 'application/json',
            data: JSON.stringify(data),
            timeout: 5000,
            success: function(response) {
                toggleGateButton(id);
            },
            error: function(response) {
                $("#alert_box").html(createAlertBox(response.responseJSON.reason));
            }
        });
    }
}

function remove_ticket(ticket_id) {
        $.ajax({
            type: "DELETE",
            url: "/api/tickets/" + ticket_id,
            dataType: 'json',
            timeout: 5000,
            success: function(response){
                $("div[id*=ticket_"+ticket_id+"_]").remove();
            },
            error: function(response) {
                $("#alert_box").html(createAlertBox(response.responseJSON.reason));
            }
        })
    }
