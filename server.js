require("dotenv").config();
const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const keys = require("./keys.js");
const request = require("request");
const fs = require("fs");
const PORT = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/submit", function (req, res) {
  // if its blank or null means user has not selected the captcha, so return the error.
  if (req.body.captcha === undefined ||
    req.body.captcha === '' ||
    req.body.captcha === null) {
    return res.json({ "success": false, "msg": "Please select captcha" });
  }
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + keys.gmailinfo.CAPTCHASECRETKEY + "&response=" + req.body.captcha + "&remoteip=" + req.connection.remoteAddress;
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl, function (err, res, body) {
    body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if (body.success !== undefined && !body.success) {
      return res.json({ "success": false, "msg": "Failed captcha verification" });
    }
  });
  let mailOptsToServer, mailOptsToClient, smtpTrans;
  var emailcontent = "";
  fs.readFile("assets/views/response.html", function (err, data) {
    emailcontent = data;
    emailcontent += req.body.message;
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
      html: req.body.message
    },
      smtpTrans.sendMail(mailOptsToServer, function (error) {
        if (error) throw err;
      });
    mailOptsToClient = {
      from: keys.gmailinfo.USEREMAIL,
      to: req.body.email,
      subject: "Thank you for contacting Irving Rivas",
      text: emailcontent 
    },
      smtpTrans.sendMail(mailOptsToClient, function (error) {
        if (error) throw error;
      });
  });
  return res.json({ "success": true, "msg": "Captcha passed" });
});

app.get("/submit", function(req,res) {
  if (req.body.success) {
    res.sendFile(path.join(__dirname, "assets/views/acknowledgement.html"));
  } else {
    res.sendFile(path.join(__dirname, "assets/views/tryagain.html"));
  }
})

app.listen(PORT, function () {
  console.log("This is running on PORT: " + PORT);
});