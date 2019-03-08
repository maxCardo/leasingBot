const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const bot = require('./assets/bot')
const db = require('./db');
const sms = require('./assets/sms');

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


users =[];
connections =[];

//------------------------------ Routs -------------------------------------//

//Lead coming in from gmail email parse
app.post('/newLead', (req, res) => {
  console.log(req.body);
  res.status(200).send();
});

app.post('/sms', async (req, res) => {
  const data = req.body;
  await updateChat(data.From, data.Body, 'User-SMS');
  updateConvoBar();
  botRespond(data.Body, data.From);
  await console.log('sending status');
  res.status(200).send();
});


//------------------------------ Sockets.on -------------------------------------//

io.sockets.on('connection', (socket) => {
  connections.push(socket);
  console.log('conected %s sockets connected', connections.length);
  updateConvoBar();

  //Disconnect UI`
  socket.on('disconnect', (data) => {
    users.splice(users.indexOf(socket.username),1);
    //updateUserNames();
    connections.splice(connections.indexOf(socket),1);
    console.log('Disconnected: %s sockets connected' , connections.length);
  });



  //send messages: on UI deployment this sends message from the UI as "manager" when bot is overridden
  socket.on('send message', (message, number) => {
    updateChat(number, message, 'Admin');
    sms.sendSMS(number, message);
    console.log('sending admin message');
  });

  //loads main chat when selected from sidebar chats list
  socket.on('get convo', (id) => {
    db.getChat(id).then((record) => {
      socket.username = record.phoneNumber;
      updateConvoBar();
      io.sockets.emit('load convo', record);
    })
  })

  socket.on('get chat', (id) => {
    db.getChat(id).then((record) => {
      io.sockets.emit('post refresh', record);
    });
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



const updateChat = (number, message, user) => {
  db.updateChat(number, message, user ).then(() => {
    io.sockets.emit('refresh chat', {num:number, msg:message, user:user});
  });
};

const updateConvoBar = () => {
  db.getAllChats().then((chats) => {
    io.sockets.emit('Convo Bar', chats);;
  });
};

const botRespond = async(text, number) => {
  const delayArr = [5000,6000,7000,8000, 5500, 6500, 7500, 8500]
  const delay = delayArr[Math.floor(Math.random()*7)];
  let responseObj = await bot.textQuery(text);
  let response =  responseObj[0].queryResult.fulfillmentText;
  db.updateChat(number, response, 'Tara').then(() => {
    setTimeout(() => {
      io.sockets.emit('refresh chat', {num:number ,msg: response , user:'Tara'});
      sms.sendSMS(number, response);
    }, delay);
  });
};

//------------------------------- deployment -------------------------------//


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`chatbot app is up on port ${port}`);
});
