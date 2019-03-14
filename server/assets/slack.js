const request = require('request-promise');
const config = require('./../config/keys');



// leasing bot hook
const hook = config.slackWebHook;

// post to slack

const postSlack = (record) => {
 console.log('record on slack call', record);

  const slackBody = {
    text: record.text,
  }

  request({
    url:`https://hooks.slack.com/services/${hook}`,
    method: 'POST',
    body: slackBody,
    json:true
  })
}

module.exports = {postSlack};
