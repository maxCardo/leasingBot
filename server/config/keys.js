require('dotenv').config();

module.exports = {
  googleProjectID:process.env.GOOGLE_PROJECT_ID_TARA,
  dialogFlowSessionID: process.env.DIALOGFLOW_SESSION_ID,
  dialogFlowSessionLanguageCode:'en-US',
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL_TARA,
  googlePrivateKey: JSON.parse(process.env.GOOGLE_PRIVATE_KEY_TARA),
  twlsid: process.env.TWLS_ID,
  twlAuthToken: process.env.TWL_AUTH_TOKEN,
  slackWebHook: process.env.SLACK_WEBHOOK
};
