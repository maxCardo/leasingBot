const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const bot = require('./assets/bot')
const db = require('./db');
const sms = require('./assets/sms');
const {postSlack} = require('./assets/slack');

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


users =[];
connections =[];

app.get('/dashboard', (req, res) => {
  res.sendFile(`${publicPath}/views/dashboard.html`);
});


//------------------------------ Post Routs -------------------------------------//
//Lead coming in from gmail email parse
app.post('/newLead', (req, res) => {
  console.log('newLead fired');
  db.newLead(req.body).then((value) => {
    sms.sendFirstSMS(value.value);
    updateConvoBar();
  });
  res.status(200).send();
});

//sends message to slack channal when error accures on google script
app.post('/postSlack', (req, res) => {
  console.log(req.body);
  postSlack(req.body);
  res.status(200).send();
});

app.post('/calandly', (req, res) => {
  console.log('calandly api fired');
  try {
    const {event, payload:{event_type: {name},event:{start_time_pretty},invitee}} = req.body;
    postSlack({text: `${event}\nProperty: ${name}.\nProspect: ${invitee.name} \nDate/Time: ${start_time_pretty}`});
    res.status(200).send('success');
  } catch (e) {
    res.status(500).send('server error');
    postSlack({text: `Error cal API:  ${e}`});
  }
});

//new sms message
app.post('/sms', (req, res) => {
  const data = req.body;
  db.updateChat(data.From, data.Body, 'User-SMS').then((record) => {
    io.sockets.emit('refresh chat', {num:data.From, msg:data.Body, user:'User-SMS'});
    console.log('bot on? : ',record.value.botOn);
    if (record.value.botOn !== false) {
      console.log('botOn');
      botRespond(data.Body, data.From);
    }else {
      console.log('bot off');
      postSlack({text: `New Mesage from: ${data.From}\n\nhttps://morning-citadel-89026.herokuapp.com/?${data.From}`});
    }
    updateConvoBar();
  });
  res.status(200).send();
});

app.post('/Dialogflow', (req, res) => {
  console.log(req.body);
  res.status(200).send();
});

//----------------------------Form Routes ---------------------------------------//
app.post('/schForm', (req, res) => {
  console.log(req.body);
  db.updateSch(req.body.phoneNumber, req.body.schDate).then(() => {
    res.sendFile(`${publicPath}/views/dashboard.html`);
  });
});

app.post('/tourForm', (req, res) => {
  console.log(req.body);
  db.updateTour(req.body).then(() => {
     res.sendFile(`${publicPath}/views/dashboard.html`);
   });
});


app.post('/appForm', (req, res) => {
  console.log(req.body);
   db.updateApp(req.body).then(() => {
  });
  res.sendFile(`${publicPath}/views/dashboard.html`);
});

app.post('/arcForm', (req, res) => {
  console.log(req.body);
   db.updateArc(req.body).then(() => {
  });
  res.sendFile(`${publicPath}/views/dashboard.html`);
});

//------------------------------ API Routs -------------------------------------//

app.get('/openLeads', (req,res) => {
  db.getActiveLeads().then((record) => {
    res.send({record});
  });
});

//------------------------------ Sockets.on -------------------------------------//

io.sockets.on('connection', (socket) => {
  connections.push(socket);
  console.log('conected %s sockets connected', connections.length);
  updateConvoBar();
  loadDash();

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

  socket.on('botOnOff', (record) => {
    console.log('socket on bot on/off fired. record: ', record);
    db.botOnOff(record).then((value) => {
      console.log('LOGGING FROM SOCKET ON: ',value);
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



const updateChat = (number, message, user) => {
  db.updateChat(number, message, user ).then(() => {
    io.sockets.emit('refresh chat', {num:number, msg:message, user:user});
  });
};

const loadDash = () => {
  db.getActiveLeads().then((record) => {
    io.sockets.emit('loadDash', record);
  })
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
  if (responseObj[0].queryResult.action === 'input.unknown') {
    console.log('input unknown');
    db.botFail(number).then((record) => io.sockets.emit('botOff', record));
    postSlack({text: `NLP Fail: ${number}`});
  }else {
    console.log('input known');
    db.updateChat(number, response, 'Tara').then(() => {
      setTimeout(() => {
        io.sockets.emit('refresh chat', {num:number ,msg: response , user:'Tara'});
        sms.sendSMS(number, response);
      }, delay);
    });
  }
};

//------------------------------- deployment -------------------------------//


const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`chatbot app is up on port ${port}`);
});
