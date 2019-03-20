
var socket = io.connect();

// ==============================event listers==================================//
$('#tbody').on('click','#calIcon', (e) => {
  console.log('calIcon',e.currentTarget.dataset.id);
});


$('#tbody').on('click','#tourIcon', (e) => {
  console.log('tourIcon',e.currentTarget.dataset.id);
});


$('#tbody').on('click','#appIcon', (e) => {
  console.log('appIcon',e.currentTarget.dataset.id);
});


$('#tbody').on('click','#arcIcon', (e) => {
  console.log('arcIcon',e.currentTarget.dataset.id);
});


// ==============================Socket Calls==================================//

socket.on('loadDash', (record) => {
  let html = '';
  for (var i = 0; i < record.length; i++) {

    html += `
    <tr id = "lead">
      <td>${record[i].name}</td>
      <td>${record[i].phoneNumber}</td>
      <td>'first contact'</td>
      <td>${record[i].last_active}</td>
      <td>'Appointment'</td>
      <td id="calIcon" data-id = "${record[i].phoneNumber}"> <a href="#" link-number = "1"><span class="fas fa-calendar-alt"></span></a></td>
      <td id="tourIcon" data-id = "${record[i].phoneNumber}"> <a href="#"><span class="fas fa-eye"></span></a></td>
      <td id="appIcon" data-id = "${record[i].phoneNumber}"> <a href="#"><span class="fas fa-file-signature"></span></a></td>
      <td id="arcIcon" data-id = "${record[i].phoneNumber}"> <a href="#"><span class="fas fa-skull-crossbones"></span></a></td>
    </tr>
    `;
  }
  $('#tbody').html(html)
});
