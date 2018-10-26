require("dotenv").config();
const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const keys = require("./keys.js");
const PORT = process.env.PORT || 8080;

const app = express();
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
            user: keys.gmailinfo.USEREMAIL,
            clientId: keys.gmailinfo.CLIENTID,
            clientSecret: keys.gmailinfo.CLIENTSECRET,
            refreshToken: keys.gmailinfo.REFRESHTOKEN,
            accessToken: keys.gmailinfo.ACCESSTOKEN
        }
    });
    mailOptsToServer = {
      from: keys.gmailinfo.USEREMAIL,
      to: keys.gmailinfo.PERSONALEMAIL,
      subject: "New message from " + req.body.email + " @ irvingrivas.com",
      text: req.body.message
    },
      smtpTrans.sendMail(mailOptsToServer, function (error) {
        if (error) throw error;
    });
    mailOptsToClient = {
        from: keys.gmailinfo.USEREMAIL,
        to: req.body.email,
        subject: "Thank you for contacting me!",
        text: "I will get back to you shortly!" + req.body.message
      },
      smtpTrans.sendMail(mailOptsToClient, function (error) {
        if (error) throw error;
      });
  });

app.listen(PORT, function() {
    console.log("This is running on PORT: " + PORT);
});