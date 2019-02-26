
const dialogFlow = require('dialogflow');
const config = require('./../config/keys');

const projectID =  config.googleProjectID;

const credentials = {
  private_key: config.googlePrivateKey,
  client_email:config.googleClientEmail
};

const sessionsClient = new dialogFlow.SessionsClient({projectID, credentials});
const sessionPath = sessionsClient.sessionPath(config.googleProjectID, config.dialogFlowSessionID);

module.exports = {
  textQuery: async function(text, params = {}) {
    let self = module.exports;
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: config.dialogFlowSessionLanguageCode,
        },
      },
      queryParams: {
        payload: {
          data: params
        }
      }
    };
    // Send request and log result
    let responses = await sessionsClient.detectIntent(request);
    responses = await self.handleAction(responses);
    return responses;
  },


  handleAction: function(responses) {
    return responses
  }

}
