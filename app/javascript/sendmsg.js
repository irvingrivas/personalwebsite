$(document).ready(function () {
    $("#send-emails").on("click", function (e) {
        e.preventDefault();
        let email_message = {
            email: $("#user-email").val().trim(),
            message: $("#user-message").val().trim(),
            captcha: $("#g-recaptcha-response").val().trim()
        };
        $.post("/reply", email_message, function(data) {
            $("#form-res").text(data.msg);
            $("#response-modal").modal("show");
        });
    });
    $("#response-modal").on("hidden.bs.modal", function() {
        $("#form-res").text("Sending email...");
    });
});