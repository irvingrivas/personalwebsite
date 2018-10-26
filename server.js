require("dotenv").config();
const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const keys = require("./keys.js");
const fs = require("fs");
const PORT = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

var verified = false;

// POST route from contact form
app.post("/", function (req, res) {
  if (req.body.message != "" && req.body.email != "" && verified) {
    let mailOptsToServer, mailOptsToClient, smtpTrans, emailcontent;
    fs.readFile("movies.txt", "utf8", function(err, data) {
      if (err) res.status(500);
      emailcontent = data;
    });
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
        if (error) {
          alert("The email you inputted does not exist!");
          return;
        }
      });
    mailOptsToClient = {
      from: keys.gmailinfo.USEREMAIL,
      to: req.body.email,
      subject: "Thank you for Contacting Irving Rivas",
      text: fs + req.body.message
    },
      smtpTrans.sendMail(mailOptsToClient, function (error) {
        if (error) throw error;
        // If there is an error here, google servers likely went down, 404 thrown below
        res.status(404).send("404");
        return;
      });
  } else {
    alert("Please check everything was submitted correctly!")
  }
});

app.post('/submit',function(req,res){
  // if its blank or null means user has not selected the captcha, so return the error.
  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    alert("Please select captcha");
    return JSON.stringify({"responseCode" : 1,"responseDesc" : "Please select captcha"});
  }
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + keys.gmailinfo.CAPTCHASECRETKEY + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl,function(err,res,body) {
    if (err) throw err;
    body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if(body.success !== undefined && !body.success) {
      alert("Failed captcha verification");
      return JSON.stringify({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
    }
    verified = true;
  });
});

app.use("*",function(req,res) {
  res.status(404).send("404");
})

app.listen(PORT, function () {
  console.log("This is running on PORT: " + PORT);
});