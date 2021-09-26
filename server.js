require("dotenv").config();
const nodemailer = require("nodemailer");
const express    = require("express");
const path       = require("path");
const keys       = require("./keys.js");
const axios      = require("axios");
const fs         = require("fs");
const PORT       = process.env.PORT || 8080;
const app        = express();

app.use(express.static(path.join(__dirname, "app")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ensure https 'gets' only, based on express-sslify (MIT License) code
app.use((req, res, next) => {

  // secure, proceed normally
  if (req.secure || ((req.headers["x-forwarded-proto"]).startsWith("https"))) {
    next();
  // insecure, redirect!
  } else if (["GET", "HEAD"].includes(req.method)) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
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

  // Hitting request to the Verification URL.
  (async () => { 
    await axios({
    method: "post",
    url: "https://www.google.com/recaptcha/api/siteverify",
    params: {
      secret: keys.gmailinfo.CAPTCHASECRETKEY,
      response: req.body.captcha,
      remoteip: req.socket.remoteAddress
    }}).then((info) => {
      console.log(info);
    }).catch((err) => {
      if (err) throw err;
      return res.json({ msg: "Your message was not sent. Invalid Captcha." });
  });

  // Get email content from user message
  let emailContent = fs.readFileSync(path.join(__dirname, "app/views/response.html")) + req.body.message;

  // Establish SMTP Transport
  let transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type         : 'OAuth2',
      user         : keys.gmailinfo.NOREPLYEMAIL,
      clientId     : keys.gmailinfo.CLIENTID,
      clientSecret : keys.gmailinfo.CLIENTSECRET,
      refreshToken : keys.gmailinfo.REFRESHTOKEN,
      accessToken  : keys.gmailinfo.ACCESSTOKEN
    }
  });

  // Send mail to User
  transport.sendMail({
    from    : keys.gmailinfo.NOREPLYEMAIL,
    to      : req.body.email,
    subject : "Thank You For Contacting Irving Rivas",
    html    : emailContent
  }).then((info) => {
    console.log("Message to user sent with Id: " + info.messageId + "sent");
  }).catch((err) => {
    if (err) throw err;
    return res.json({ msg: "Your message was not sent. " +
    "Please check your email entry on form." });
  });

  // Send mail to me 
  transport.sendMail({
    from    : keys.gmailinfo.NOREPLYEMAIL,
    to      : keys.gmailinfo.PERSONALEMAIL,
    subject : "New message from " + req.body.email + " @ irvingrivas.com",
    text    : req.body.message
  }).then((info) => {
    console.log("Message to me sent with Id: " + info.messageId + "sent");
  }).catch((err) => {
    if (err) throw err;
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