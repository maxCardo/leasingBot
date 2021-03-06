
var socket = io.connect();
var $messageForm = $('#messageForm');
var $messageArea = $('#messageArea');
var $message = $('#message');
var $chat = $('#chat');
var $userFormArea = $('#userFormArea');
var $userForm = $('#userForm');
var $users = $('#users');
var $username = $('#username');


//--------------------------- Scoket IO Functions -----------------------------//
$(function () {

  socket.on('refresh chat', (data) => {
    const openChat = $('#chatDetails')[0].innerHTML;
    if (openChat === data.num) {
      postRerfreshChat(data.user, data.msg);
      scrollToBottom();
    }else {
      console.log('chat not active');
    };
  });

  socket.on('Convo Bar', (data) => {
    var html = '';
    for (var i = 0; i < data.length; i++) {
      let unread = '';
      if (data[i].unread === true) {
        unread = 'style= "font-weight: bold";'
      }
      html += `<li id="convo" class="list-group-item" ${unread}>${data[i].phoneNumber}</li>`;
    };
    $users.html(html);

  });

  socket.on('bot refresh', (data) => {
    const openChat = $('#chatDetails')[0].innerHTML;
    if (openChat === data.chat) {
      postRerfreshChat(data.user, data.msg);
      scrollToBottom();
    }else {
      console.log('chat not active');
    }
  });

  $messageForm.submit((e) => {
    e.preventDefault();
    const openChat = $('#chatDetails')[0].innerHTML;
    if ($message.val()) {
      console.log(openChat);
      socket.emit('send message', $message.val(), openChat);
      $message.val('');
    }else {
      $('#messageError').show()
    }
  });

  socket.on('new message', (data) => {
    $chat.append(`<div id= "messageDiv" class="well"><strong>${data.user}:</strong><br/>${data.msg}</div>`);
    scrollToBottom();
  });


  $userForm.submit((e) => {
    e.preventDefault();
    var newUser = {
      name: $username.val()
    }
    socket.emit('new user', newUser, (data) => {
      if (data) {
        $userFormArea.hide();
        $messageArea.show();
      }
    });
    $username.val('');
    console.log('message form emited');
  });
  socket.on('get users', (data) => {
    var html = '';
    for (var i = 0; i < data.length; i++) {
      html += `<li class="list-group-item">${data[i]}</li>`;
    };
    $users.html(html);
  });


  //switched emit on botRespond to 'post refresh'

  socket.on('load convo', (data) => {
    console.log(data.value.botOn);
    $('#chatDetails').html(data.value.phoneNumber)
    const chat = data.value.chats;
    for (var i = 0; i < chat.length; i++) {
      let time = moment(chat[i].Date).format('dddd MMM Do @ h:mm a');
      $chat.append(`<div id = "messageDiv" class="well"><strong>${chat[i].from}:</strong><br/>${chat[i].message}<span id="timeStamp">${time}</span></div>`);
      scrollToBottom();
    }
    if (data.value.botOn === false){
      $('#botBtn').toggleClass('btn-danger');
      console.log(data.value.botOn);
    };
    $('.msgBtn').prop('disabled', false);
  })


  socket.on('post refresh', (data) => {
    const chat = data.value.chats;
    console.log('post refresh: ', chat);
    let time = moment(chat.Date).format('dddd MMM Do @ h:mm a');
    $chat.append(`<div id = "messageDiv" class="well"><strong>${chat[chat.length-1].from}:</strong><br/>${chat[chat.length-1].message} <span id="timeStamp">${time}</span></div>`);
    scrollToBottom();
  })

  socket.on('botOff', (record) => {
    console.log(record.value.chats);
    $('#botBtn').addClass('btn-danger');
  });


});

// Auto scroll to bottom of page when messages are submited
function scrollToBottom() {
  //selector
  var messages = $('#chat');
  var newMessage = messages.children('div:last-child');

  //heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop +newMessageHeight+lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

const postRerfreshChat = (user,msg) => {
  let time = moment(new Date).format('dddd MMM Do @ h:mm a');;
  return $chat.append(`<div id="messageDiv" class="well"><strong>${user}:</strong><br/>${msg}<span id="timeStamp">${time}</span></div>`)
}

//-----------------------------event listners----------------------------------//
//show chat menue on small viewpoert
$('#chatMenu').on('click', () => {
  $('#sidebar').css({"display":"block"})
});

//click x to close
$('#chatCloseBtn').on('click', (e) => {
  e.preventDefault();
  $('#sidebar').css({"display":"none"})
  $('#chatMenu').css({"display":"block"})
});

//submit form when enter key is hit within the text area
$(document).ready(() => {
  var utm = window.location.search.substring(1);
  var number = /\+[0-9]{11}/;
  var result = number.test(utm);

  if (utm !== '' && result === true) {
    socket.emit('get convo', utm);
  }



  $('#message').keypress(function (e) {
    if (e.which == 13) {
      $('#sendMessageBtn').click();
      return false;
    }
  });

  // remove error message when newly entering message in text area
  $('#message').keypress(function (e) {
    $('#messageError').hide()
  });

  // select chat from sidebar and display on main div
  $('#users').on('click','#convo', (e) => {
    console.log('selected');
    socket.emit('get convo', e.currentTarget.innerHTML);
    $('#chat').empty();
  });

  $('#botBtn').on('click', () => {
    const openChat = $('#chatDetails')[0].innerHTML;
    console.log('botBtn hit', openChat);
    $('#botBtn').toggleClass('btn-danger');
    socket.emit('botOnOff', openChat);
  });

});
