
var socket = io.connect();

// ==============================event listers==================================//

//click outside modal to close
$(window).on('click', (e) => {
  if (e.target.className === 'popUpModal') {
    $('.popUpModal').css({"display":"none"})
    $('.form-control').val('');
  }
});

//click x to close
$('.closeBtn').on('click', (e) => {
  e.preventDefault();
  $('.popUpModal').css({"display":"none"})
  $('.form-control').val('');
});

//click icons to bring up models
$('#tbody').on('click','#calIcon', (e) => {
  console.log('calIcon',e.currentTarget.dataset.id, e.currentTarget.dataset.name, e.currentTarget.dataset.appt);
  $('.IDInput').val(e.currentTarget.dataset.id);
  $('.prospectName').val(e.currentTarget.dataset.name);
  $('#schModal').css({"display": "block"});
});


$('#tbody').on('click','#tourIcon', (e) => {
  $('.IDInput').val(e.currentTarget.dataset.id);
  $('.prospectName').val(e.currentTarget.dataset.name);
  $('.schDate').val(e.currentTarget.dataset.appt);
  $('#tourModal').css({"display": "block"});
});


$('#tbody').on('click','#appIcon', (e) => {
  $('.IDInput').val(e.currentTarget.dataset.id);
  $('.prospectName').val(e.currentTarget.dataset.name);
  $('.schDate').val(e.currentTarget.dataset.appt);
  $('#appModal').css({"display": "block"});

});


$('#tbody').on('click','#arcIcon', (e) => {
  $('.IDInput').val(e.currentTarget.dataset.id);
  $('#arcModal').css({"display": "block"});
});

// $('#schSubmitBtn').on('click', (e) => {
//   e.preventDefault();
//   console.log(e);
// });

// $('#schForm').submit((e) => {
//   e.preventDefault();
//   console.log(e);
// })

// ==============================Socket Calls==================================//

socket.on('loadDash', (record) => {
  let html = '';
  for (var i = 0; i < record.length; i++) {
    var dataString = JSON.stringify(record[i]);
    html += `
    <tr id = "lead">
      <td>${record[i].name}</td>
      <td>${record[i].phoneNumber}</td>
      <td>'first contact'</td>
      <td>${record[i].last_active}</td>
      <td>${record[i].schDate}</td>
      <td>${record[i].tourRes}</td>
      <td>${record[i].tourInterest}</td>
      <td>${record[i].application}</td>
      <td>${record[i].appStatus}</td>
      <td id="chatIcon" data-id = "${record[i].phoneNumber}" data-name = "${record[i].name}" data-appt = "insert appt"> <a href="/?${record[i].phoneNumber}" link-number = "1"><span class="fas fa-sms"></span></a></td>
      <td id="calIcon" data-id = "${record[i].phoneNumber}" data-name = "${record[i].name}" data-appt = "insert appt"> <a href="#" link-number = "1"><span class="fas fa-calendar-alt"></span></a></td>
      <td id="tourIcon" data-id = "${record[i].phoneNumber}" data-name = "${record[i].name}" data-appt = "insert appt"> <a href="#"><span class="fas fa-eye"></span></a></td>
      <td id="appIcon" data-id = "${record[i].phoneNumber}" data-name = "${record[i].name}" data-appt = "insert appt"> <a href="#"><span class="fas fa-file-signature"></span></a></td>
      <td id="arcIcon" data-id = "${record[i].phoneNumber}" data-name = "${record[i].name}" data-appt = "insert appt"> <a href="#"><span class="fas fa-skull-crossbones"></span></a></td>
    </tr>
    `;
  }
  $('#tbody').html(html)
});

// date picker JS
$(function() {
  $('#datetimepicker1').datetimepicker();
});
