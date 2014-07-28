function userShow() {
  $.get('/user/1/show', function(data) {
    $.get('tpl/user_show.mst', function(template) {
      var rendered = Mustache.render(template, data);
      $('#user_show').html(rendered);
      userEdit();
    });
  });
};

function userEdit() {
  $('#edit_user_info').click(function() {
    $('#user_show').hide();
    $.get('/user/1/show', function(data) {
      $.get('tpl/user_edit.mst', function(template) {
        var rendered = Mustache.render(template, data);
        $('#user_edit').html(rendered);
        userSave();
      });
    });
  });
};

function userSave() {
  $('#save_user_info').click(function() {
    $('#edit_user_info').hide();
    $('#user_show').show();
    $( this ).preventDefault();
  });
};

function userPhotoShow() {
  $.get('/user/1/show', function(data) {
    $.get('tpl/user_photo.mst', function(template) {
      var rendered = Mustache.render(template, data);
      $('#user_photo').html(rendered);
      userPhotoEdit();
    });
  });
};

function userPhotoEdit() {
  $('#edit_user_photo').click(function() {
    $('#user_photo').hide();
    $.get('/user/photos', function(data) {
      $.get('tpl/user_photo_edit.mst', function(template) {
        var rendered = Mustache.render(template, data);
        $('#user_photo_edit').html(rendered);
        //userPhotoShow();
      });
    });
  });
};

$(document).ready( userShow() );
$(document).ready( userPhotoShow() );
