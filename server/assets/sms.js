
const config = require('./../config/keys')

const client = require('twilio')(config.twlsid, config.twlAuthToken);


const sendSMS= (to,body) => {
  console.log('run send SMS');
  // client.messages
  // .create({
  //   body: body,
  //   from:'+14124447505',
  //   to: to
  // })
  // .then(message => console.log(message.sid))
  // .done();
}

module.exports = {sendSMS};
