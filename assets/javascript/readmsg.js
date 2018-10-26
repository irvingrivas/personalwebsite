$(document).ready(function(){
    $("#send-emails").on("click", function() {
        var email_message = {
            email: $("#user-email").val().trim(),
            message: $("#user-message").val().trim()
        };
        $.post("/",email_message);
    });
});