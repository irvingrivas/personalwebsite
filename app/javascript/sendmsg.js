$(document).ready(function () {
    $("#send-emails").on("click", function () {
        var email_message = {
            email: $("#user-email").val().trim(),
            message: $("#user-message").val().trim(),
            captcha: $("#g-recaptcha-response").val().trim()
        };
        $.post("/reply", email_message, function(){
            console.log("Change URL");
            docuemnt.location.href = "www.irvingrivas.com/reply"
        });
    });
});