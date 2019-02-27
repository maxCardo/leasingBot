const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io').listen(server);
const bodyParser = require('body-parser');

const bot = require('./assets/bot')
const db = require('./db');
const sms = require('./assets/sms');

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


users =[];
connections =[];

//------------------------------ Routs -------------------------------------//

app.get('/' , (req, res) => {
  db.getAllChats().then((convos) => {
    res.sendFile(publicPath + '/index.html');
    return convos
  }).then((convos) => updateConvoBar(convos));

});

app.post('/sms', (req,res) => {
  const data = req.body;
  db.updateChat(data.From, data.Body, 'userSMS').then(() => {
    io.sockets.emit('refresh chat', data.From);
  }).then(() => {
    //update convo bar
    db.getAllChats().then((chats) => updateConvoBar(chats));
    //send bot response
    const response = botRespond(data.Body, data.From);
    //sms.sendSMS(data.From, response);
    res.status(200).send()
  })

});

//------------------------------ Sockets.on -------------------------------------//

io.sockets.on('connection', (socket) => {
  //connect UI, loads all chats into the sidebar chat list
  connections.push(socket);
  console.log('conected %s sockets connected', connections.length);
  db.getAllChats().then((chats) => updateConvoBar(chats));

  //Disconnect UI`
  socket.on('disconnect', (data) => {
    users.splice(users.indexOf(socket.username),1);
    //updateUserNames();
    connections.splice(connections.indexOf(socket),1);
    console.log('Disconnected: %s sockets connected' , connections.length);
  });

  // //add user (not used for UI deployment)
  // socket.on('new user', (data, callback) => {
  //   callback(true);
  //   db.newChat(data)
  //   socket.username = data.name;
  //   users.push(socket.username);
  //   updateUserNames();
  // });

  //send messages: on UI deployment this sends message from the UI as "manager" when bot is overridden
  socket.on('send message', (data) => {
    db.getChat(socket.username).then((chat) => {
      // TODO: change below to user.num
      // TODO:  toggle off bot
      sms.sendSMS(chat.name, data);
    }).then(() => {
      //io.sockets.emit('new message', {msg: data, user: 'Manager'});
      db.updateChat(socket.username, data, 'Manager');
    });
  });

  //loads main chat when selected from sidebar chats list
  socket.on('get convo', (id) => {
    db.getChat(id).then((record) => {
      socket.username = record.name;
      io.sockets.emit('load convo', record);
    })
  })

  socket.on('get chat', (id) => {
    db.getChat(id).then((record) => {;
      io.sockets.emit('post refresh', record);
    })
  })

  // // updates sidebar user names. not used on UI/sms deployment
  // function updateUserNames() {
  //   io.sockets.emit('get users', users);
  // };
  //
  // const updateMainChat = () => {
  //   //if active socket on main chat. update main chat
  //   console.log('running updateMainChat');
  //   if (socket.username) {
  //     db.getChat(socket.username).then((record) => {
  //       console.log('got chat for :', socket.username);
  //       io.sockets.emit('load convo', record);
  //     })
  //   }
  // }

});

//------------------------------ Suport Functions -----------------------------//


function updateConvoBar(data) {
  io.sockets.emit('Convo Bar', data);
};


const botRespond = async (text, user) => {
  let responseObj = await bot.textQuery(text);
  let response = responseObj[0].queryResult.fulfillmentText;
  db.updateChat(user, response, 'Tara')
  io.sockets.emit('bot refresh', {chat:user ,msg: response , user:'Tara'});
  return response;
};

//------------------------------- deployment -------------------------------//


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`chatbot app is up on port ${port}`);
});
