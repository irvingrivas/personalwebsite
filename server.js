require("dotenv").config();
const nodemailer = require('nodemailer');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var path = require("path");
var keys = require("./keys.js");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
 });

// POST route from contact form
app.post("/", function (req, res) { 
    let mailOptsToServer, mailOptsToClient, smtpTrans;
    smtpTrans = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
            type: 'OAuth2',
            user: keys.gmailinfo.user,
            serviceClient: keys.gmailinfo.serviceClient,
            privateKey: keys.gmailinfo.privateKey
    }
    });
    mailOptsToServer = {
      from: req.body.email,
      to: keys.gmailinfo.user,
      subject: "New message from contact form at irvingrivas.com",
      text: req.body.message
    },
      smtpTrans.sendMail(mailOptsToServer, function (error, response) {
        if (error) throw error;
        else {
            console.log("Successfully Sent!");
        }
    });
    mailOptsToClient = {
        from: keys.gmailinfo.user,
        to: req.body.email,
        subject: "Thank you for contacting me!",
        text: "I will get back to you shortly!" + req.body.message
      },
      smtpTrans.sendMail(mailOptsToClient, function (error, response) {
        if (error) throw error;
        else {
            console.log("Successfully Sent!");
        }
      });
  });

app.listen(8001, function() {
    console.log("This is running on PORT: " + 8001);
});