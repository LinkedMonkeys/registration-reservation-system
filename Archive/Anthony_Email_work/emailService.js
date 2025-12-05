const { google } = require("googleapis");
const nodemailer = require("nodemailer");

const CLIENT_ID = "PASTE_YOUR_CLIENT_ID_HERE";
const CLIENT_SECRET = "PASTE_YOUR_CLIENT_SECRET_HERE";
const REDIRECT_URI = "http://localhost:3000/oauth2callback";
const REFRESH_TOKEN = "PASTE_REFRESH_TOKEN_AFTER_SETUP";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendEmail(to, subject, message) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "anthonypacs98@gmail.com", //Replace with the email we want to use, not figured it out yet but working on it
        clientId: 567717028074-asq7dtf6lnj4gvbfhju8d873ebpkqheh.apps.googleusercontent.com,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken
      }
    });

    const mailOptions = {
      from: "Academic Advising <YOUR_SYSTEM_EMAIL@gmail.com>",
      to,
      subject,
      text: message
    };

    const result = await transport.sendMail(mailOptions);
    return result;

  } catch (error) {
    console.log("Email Error:", error);
    throw error;
  }
}

module.exports = sendEmail;
