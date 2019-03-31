
$(function () {
  var socket = io.connect();
  loadLeads()
  //$('#openLeadTable').DataTable();
  $('#datetimepicker1').datetimepicker();
});

const loadLeads = () => {
  let html = '';
  $.ajax({url: '/openLeads',success: (leads) => {
      $.each(leads.record, (i,lead) => {
        html += `
          <tr id = "lead">
            <td>${lead.name}</td>
            <td>${lead.phoneNumber}</td>
            <td>'first contact'</td>
            <td>${lead.last_active}</td>
            <td>${lead.schDate}</td>
            <td>${lead.tourRes}</td>
            <td>${lead.tourInterest}</td>
            <td>${lead.application}</td>
            <td>${lead.appStatus}</td>
            <td id="chatIcon" data-id = "${lead.phoneNumber}" data-name = "${lead.name}" data-appt = "insert appt"> <a href="/?${lead.phoneNumber}" link-number = "1"><span class="fas fa-sms"></span></a></td>
            <td id="calIcon" data-id = "${lead.phoneNumber}" data-name = "${lead.name}" data-appt = "insert appt"> <a href="#" link-number = "1"><span class="fas fa-calendar-alt"></span></a></td>
            <td id="tourIcon" data-id = "${lead.phoneNumber}" data-name = "${lead.name}" data-appt = "insert appt"> <a href="#"><span class="fas fa-eye"></span></a></td>
            <td id="appIcon" data-id = "${lead.phoneNumber}" data-name = "${lead.name}" data-appt = "insert appt"> <a href="#"><span class="fas fa-file-signature"></span></a></td>
            <td id="arcIcon" data-id = "${lead.phoneNumber}" data-name = "${lead.name}" data-appt = "insert appt"> <a href="#"><span class="fas fa-skull-crossbones"></span></a></td>
          </tr>
        `;
      });
      $('#tbody').html(html)
    }
  })
}

const loadLeadsFilter = (searchString) => {
  let html = '';
  let log = false

  $.ajax({url: '/openLeads',success: (leads) => {
      $.each(leads.record, (i,lead) => {

        let name = lead.name;
        let compString = searchString.toUpperCase();

        try {
          name = name.toUpperCase();
        } catch (e) {
        }

        if (name && name.includes(compString)) {
          html += `
          <tr id = "lead">
          <td>${lead.name}</td>
          <td>${lead.phoneNumber}</td>
          <td>'first contact'</td>
          <td>${lead.last_active}</td>
          <td>${lead.schDate}</td>
          <td>${lead.tourRes}</td>
          <td>${lead.tourInterest}</td>
          <td>${lead.application}</td>
          <td>${lead.appStatus}</td>
          <td id="chatIcon" data-id = "${lead.phoneNumber}" data-name = "${lead.name}" data-appt = "insert appt"> <a href="/?${lead.phoneNumber}" link-number = "1"><span class="fas fa-sms"></span></a></td>
          <td id="calIcon" data-id = "${lead.phoneNumber}" data-name = "${lead.name}" data-appt = "insert appt"> <a href="#" link-number = "1"><span class="fas fa-calendar-alt"></span></a></td>
          <td id="tourIcon" data-id = "${lead.phoneNumber}" data-name = "${lead.name}" data-appt = "insert appt"> <a href="#"><span class="fas fa-eye"></span></a></td>
          <td id="appIcon" data-id = "${lead.phoneNumber}" data-name = "${lead.name}" data-appt = "insert appt"> <a href="#"><span class="fas fa-file-signature"></span></a></td>
          <td id="arcIcon" data-id = "${lead.phoneNumber}" data-name = "${lead.name}" data-appt = "insert appt"> <a href="#"><span class="fas fa-skull-crossbones"></span></a></td>
          </tr>
          `;
        }
      });
      $('#tbody').html(html)
    }
  })
}

// ==============================event listers==================================//

//searchBox
$('#searchBox').on('input', () => {
  let value = $('#searchBox').val();
  loadLeadsFilter(value);
})

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
