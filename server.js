require("dotenv").config();
const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const keys = require("./keys.js");
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
    let mailOptsToServer, mailOptsToClient, smtpTrans;
    var emailcontent = "";
    fs.readFile("./assets/viwes/response.html", "utf8", function(err, data) {
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
      text: emailcontent + req.body.message
    },
      smtpTrans.sendMail(mailOptsToServer, function (error) {
        if (error) {
          alert("The email you inputted does not exist!");
        } else {
          alert("Thank you for submitting your message!");
        }
      });
    mailOptsToClient = {
      from: keys.gmailinfo.USEREMAIL,
      to: req.body.email,
      subject: "Thank you for Contacting Irving Rivas",
      text: emailcontent + req.body.message
    },
      smtpTrans.sendMail(mailOptsToClient, function (error) {
        if (error) res.status(404).send("404");
      });
  } else {
    alert("Please check everything was submitted correctly!")
  }
});

app.post('/submit',function(req,res){
  // if its blank or null means user has not selected the captcha, so return the error.
  if(req.body['g-recaptcha-response'] === undefined || 
    req.body['g-recaptcha-response'] === '' || 
    req.body['g-recaptcha-response'] === null) {
    return res.json({"success": false, "msg":"Please select captcha"});
  }
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + keys.gmailinfo.CAPTCHASECRETKEY + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl,function(err,res,body) {
    body = JSON.parse(body);
    console.log(body);
    // Success will be true or false depending upon captcha validation.
    if(body.success !== undefined && !body.success) {
      return res.json({"success": false, "msg":"Failed captcha verification"});
    }
    return res.json({"success": true, "msg":"Captcha passed"});
  });
});

app.use("*",function(req,res) {
  res.status(404).send("404");
})

app.listen(PORT, function () {
  console.log("This is running on PORT: " + PORT);
});