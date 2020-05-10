require("dotenv").config();
const nodemailer = require('nodemailer');
const express    = require('express');
const bodyParser = require('body-parser')
const path       = require("path");
const keys       = require("./keys.js");
const request    = require("request");
const fs         = require("fs");
const PORT       = process.env.PORT || 8080;
const app        = express();

app.use(express.static(path.join(__dirname, "app")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "app/views/index.html"));
});

app.post("/reply", (req, res) => {

  // if its blank or null means user has not selected the captcha, so return the error.
  if (req.body.captcha === undefined ||
    req.body.captcha === '' ||
    req.body.captcha === null) {
    return res.json({ msg: "Your message was not sent. Please validate captcha." })
  } else if (
    req.body.email === undefined ||
    req.body.email === '' ||
    req.body.email === null) {
    return res.json({ msg: "Your message was not sent. Please input contact info." })
  }

  // Hitting GET request to the Verification URL.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + 
    keys.gmailinfo.CAPTCHASECRETKEY + "&response=" + req.body.captcha + 
    "&remoteip=" + req.connection.remoteAddress;
  
  request(verificationUrl, (err) => {
    if (err) return res.json({ msg: "Your message was not sent. Invalid Captcha." });
  });

  // Get email content from user message
  let emailContent = req.body.message;
  fs.readFileSync("app/views/response.html", (err, data) => {
    if (err) throw err;
    emailContent = data + emailContent;
  });

  // Establish SMPT Transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: keys.gmailinfo.NOREPLYEMAIL,
      clientId: keys.gmailinfo.CLIENTID,
      clientSecret: keys.gmailinfo.CLIENTSECRET,
      refreshToken: keys.gmailinfo.REFRESHTOKEN,
      accessToken: keys.gmailinfo.ACCESSTOKEN
    }
  });

  // Send mail to User
  transporter.sendMail({
    from: keys.gmailinfo.NOREPLYEMAIL,
    to: req.body.email,
    subject: "Thank You For Contacting Irving Rivas",
    html: emailcontent
  }, (err) => {
    if (err) return res.json({ msg: "Your message was not sent. " +
      "Please check your email entry on form." });
  });

  // Send mail to me 
  transporter.sendMail({
    from: keys.gmailinfo.NOREPLYEMAIL,
    to: keys.gmailinfo.PERSONALEMAIL,
    subject: "New message from " + req.body.email + " @ irvingrivas.com",
    text: req.body.message
  }, () => {
      return res.json({ msg: "Your message was sent! " +
        "Please check your inbox for confirmation." });
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "app/views/index.html"));
});

app.listen(PORT, () => {
  console.log("This is running on http://localhost:" + PORT);
});