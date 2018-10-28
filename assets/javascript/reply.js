$(document).ready(function () {
    $.get("/submit/reply", function (data) {
        console.log(data);
        if (data.success) {
            $("#mtitle").text("Contact Message Sent!");
            $("#mmes").text("Your message was sucessfully sent!");
        } else {
            $("#mtitle").text("Contact Message Not Sent");
            $("#mmes").text("Your message was not sucessfully sent. " + data.errmsg);
        }
    });
});