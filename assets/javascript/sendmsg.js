$(document).ready(function () {
    $("#send-emails").on("click", function () {
        var email_message = {
            email: $("#user-email").val().trim(),
            message: $("#user-message").val().trim(),
            isRobot:  $("#g-recaptcha-response").val().trim()
        };
        $.post("/", email_message);
    });
});