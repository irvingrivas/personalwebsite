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
app.use(express.static(path.join(__dirname, "app")));
var isSuccessful = false;
var errmsg = "";

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "app/views/index.html"));
});

app.get("/submit", function (req, res) {
  res.sendFile(path.join(__dirname, "app/views/reply.html"));
});

app.get("/submit/reply", function (req, res) {
  return res.json({ "success": isSuccessful, "msg": errmsg });
});

app.post("/", function (req, res) {
  // if its blank or null means user has not selected the captcha, so return the error.
  if (req.body.captcha === undefined ||
    req.body.captcha === '' ||
    req.body.captcha === null) {
    errmsg = "Please select captcha"; return;
  }
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + keys.gmailinfo.CAPTCHASECRETKEY + "&response=" + req.body.captcha + "&remoteip=" + req.connection.remoteAddress;
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl, function (err, res, body) {
    body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if (body.success !== undefined && !body.success) {
      errmsg = "Failed captcha verification"; return;
    }
    let mailOptsToServer, mailOptsToClient, smtpTrans;
    var emailcontent = "";
    fs.readFile("app/views/response.html", function (err, data) {
      if (err) throw err;
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
        text: req.body.message
      },
        smtpTrans.sendMail(mailOptsToServer, function (error) {
          if (error) throw err;
          mailOptsToClient = {
            from: keys.gmailinfo.USEREMAIL,
            to: req.body.email,
            subject: "Thank You for contacting Irving Rivas",
            html: emailcontent
          },
            smtpTrans.sendMail(mailOptsToClient, function (error) {
              if (error) throw error;
              isSuccessful = true;
            });
        });
    });
  });
});

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "app/views/index.html"));
});

app.listen(PORT, function () {
  console.log("This is running on PORT: " + PORT);
});