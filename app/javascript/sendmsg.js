$(document).ready(function () {
    $("#send-emails").on("click", function () {
        var email_message = {
            email: $("#user-email").val().trim(),
            message: $("#user-message").val().trim(),
            captcha: $("#g-recaptcha-response").val().trim()
        };
        $.post("/reply", email_message, function(){
            window.location = "http://www.irvingrivas.com/reply"
        });
    });
});