document.getElementById('save_gate').onclick = function(){
        name = $("#name").val();
        data = {
            "group": $("#group").val(),
            "environments": $("#environments").val().split(',')
        };
        if(data["environments"].length == 1 && data["environments"][0] == ""){
            data["environments"] = ["develop","live"]
        }
        $.ajax({
                type: "POST",
                url: "/api/services/"+name,
                contentType: 'application/json',
                timeout: 5000,
                data: JSON.stringify(data),
                success: function(response){
                    $.colorbox.close()
                },
                error: function(response) {
                    $("#new_gate_alert_box").html(createAlertBox(response.responseJSON.reason));
                }
            });
    };

function createAlertBox(errorMsg) {
    return "<div class=\"alert alert-dismissible alert-danger\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">×</button><strong>" + errorMsg + "</strong></div>";
}
