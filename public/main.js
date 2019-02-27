
var socket = io.connect();

//--------------------------- Scoket IO Functions -----------------------------//
$(function () {
  var $messageForm = $('#messageForm');
  var $messageArea = $('#messageArea');
  var $message = $('#message');
  var $chat = $('#chat');
  var $userFormArea = $('#userFormArea');
  var $userForm = $('#userForm');
  var $users = $('#users');
  var $username = $('#username');


  $messageForm.submit((e) => {
    e.preventDefault();
    if ($message.val()) {
      socket.emit('send message', $message.val());
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

  socket.on('Convo Bar', (data) => {
    var html = '';
    for (var i = 0; i < data.length; i++) {
      html += `<li id="convo" class="list-group-item">${data[i].name}</li>`;
    };
    $users.html(html);

  });

  //switched emit on botRespond to 'post refresh'

  socket.on('load convo', (data) => {
    $('#chatDetails').html(data.name)
    const chat = data.chats;
    for (var i = 0; i < chat.length; i++) {
      $chat.append(`<div id = "messageDiv" class="well"><strong>${chat[i].from}:</strong><br/>${chat[i].message}</div>`);
      scrollToBottom();
    }
  })

  socket.on('refresh chat', (record) => {
    const openChat = $('#chatDetails')[0].innerHTML;
    if (openChat === record) {
      socket.emit('get chat', openChat);
    }
  })

  socket.on('post refresh', (data) => {
    const chat = data.chats;
    $chat.append(`<div id = "messageDiv" class="well"><strong>${chat[chat.length-1].from}:</strong><br/>${chat[chat.length-1].message}</div>`);
    scrollToBottom();
  })

  socket.on('bot refresh', (data) => {
    const openChat = $('#chatDetails')[0].innerHTML;
    if (openChat === data.chat) {
      //socket.emit('get chat', openChat);
      $chat.append(`<div id="messageDiv" class="well"><strong>${data.user}:</strong><br/>${data.msg}</div>`);
      scrollToBottom();
    }else {
      console.log('chat not active');
    }
  })

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

//-----------------------------event listners----------------------------------//
//submit form when enter key is hit within the text area
$(document).ready(() => {
  $('#message').keypress(function (e) {
    if (e.which == 13) {
      $('#sendMessageBtn').click();
      return false;
    }
  });

  $('#message').keypress(function (e) {
    $('#messageError').hide()
  });

  $('#users').on('click','#convo', (e) => {
    socket.emit('get convo', e.currentTarget.innerHTML);
    $('#chat').empty();
    //$('#messageDiv').remove();
  });

});
