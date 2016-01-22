function closeNewUrlModal() {
  $('#addRSSUrlModalLabel').modal('hide')
}

// show modal window for loading url to database
$(document).on('click','.js_show-add-url',function() {
  $('.js_input-add-url').val('');
  $('.js_input-add-type').val('main');
  $('.js_button-selector').text('Выберите тип RSS...');
  $('#addRSSUrlModalLabel').modal('show');
});

// load url to database
$(document).on('click', '.js_submit-add-url', function() {
  var data = {
    url: $('.js_input-add-url').val(),
    type: $('.js_input-add-type').val(),
  };
  $.post('/save', data, function() {
    location.reload();
  });
  closeNewUrlModal();
});

// helpfull script for selecting type of RSS url
$(document).on('click', '.js_select-add-url-type', function() {
  var $self = $(this);
  var typeText = $self.text();
  var typeValue = $self.find('a').attr('data-type');
  $('.js_button-selector').text(typeText);
  $('.js_input-add-type').val(typeValue);
});

// load url to database
$(document).on('click', '.js_set-filter', function() {
  var $self = $(this);
  var data = {
    val: $self.attr('data-filter')
  };
  $.post('/saveFilter', data, function() {
    location.reload();
  });
});

$(document).on('click', '.js_show-about', function() {
  $('#aboutModal').modal('show');
});