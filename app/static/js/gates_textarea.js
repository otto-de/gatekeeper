jQuery.each(jQuery('textarea[data-autoresize]'), function() {
    var i;
    var t;
    var has_changed = false;
    var offset = this.offsetHeight - this.clientHeight;
    var resizeTextarea = function(el) {
        jQuery(el).css('height', 'auto').css('height', el.scrollHeight + offset);
    };
    resizeTextarea(this);

    jQuery(this).on('keyup input', function() {
        has_changed = true;
        resizeTextarea(this);
     }).removeAttr('data-autoresize');

    var save = function(el){
        data = {
            "message": ""+el.value
        }
        if(has_changed){
            has_changed = false;
            $.ajax({
                type: "PUT",
                url: "/api/services/" + el.getAttribute("name") + "/" + el.getAttribute("env"),
                contentType: 'application/json',
                timeout: 5000,
                data: JSON.stringify(data),
                success: function(response){
                    var t = $("#"+el.getAttribute("name")+"-"+el.getAttribute("env")+"-message-timestamp")
                    t.text("now");
                },
                error: function(response) {
                    has_changed = true;
                    $("#alert_box").html(createAlertBox(response.responseJSON.reason));
                }
            });
        }
    }

    jQuery(this).focus( function() {
        t = this;
        i = setInterval( function() { save(t) }, 1000)
    });
    jQuery(this).focusout( function() {
        clearInterval(i);
        save(this);
    });
});