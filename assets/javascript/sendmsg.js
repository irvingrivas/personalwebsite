$(document).ready(function () {
    $('#comment_form').submit(function () {
        $(this).ajaxSubmit({
            error: function (err) {
                console.log("You may be a bot.")
                status('Error: ' + err.status);
            },
            success: function () {
                console.log("You are a person!");
            }
        });
        //Very important line, it disable the page refresh.
        return false;
    });
    $("#send-emails").on("click", function () {
        var email_message = {
            email: $("#user-email").val().trim(),
            message: $("#user-message").val().trim()
        };
        $.post("/", email_message);
    });
});