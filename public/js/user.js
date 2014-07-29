
var loadData = function(dataUrl, tplUrl, callback) {
  $.get(dataUrl, function(data) {
    $.get(tplUrl, function(template) {
      var rendered = Mustache.render(template, data);
      callback(rendered);
    });
  });
};

var userShow = function() {
  loadData('/user/1/show', 'tpl/user_show.mst', function(r) {
    $('#user_show').html(r);
    //userEdit();
  });
};

$(document).ready( userShow() );

var setState = function(state) {
  var states = ['edit', 'show', 'save'];
  for(var i = 0; i < states.length; var += 1) {
    if (state !== states[i]) {
      $('#user_' + states).hide();
    };
  };
};

var userEdit = function() {
  setState('edit');
  loadData('/user/1/show', 'tpl/user_edit.mst', function(r) {
  $('#user_edit').html(r);
    userSave();
  });
});
};

var userSave = function() {
  $('#save_user_info').click(function() {
    var form_data = $('form').serializeJSON();
    alert(form_data);
    $.ajax({
      type: "POST",
      url: "/user/save",
      data: form_data,
      error: function() {
        $('#status').text('有错！').slideDown('slow');
      },
      success: function() {
        $('#status').text('更新成功了');
      },
      complete: function() {
        $('#status').text('complete');
      }
    });
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

function userPhotoSave() {
  $('#save_user_photo').click(function() {
    var form_data = $('form').serializeJSON();
    $('#status').text('i am here');
    alert(form_data);
    $.ajax({
      type: "POST",
      url: "/user/save",
      data: form_data,
      error: function() {
        $('#status').text('有错！').slideDown('slow');
      },
      success: function() {
        $('#status').text('更新成功了');
      },
      complete: function() { //错误和正确都执行
        $('#status').text('complete').slideDown('slow');
      }
    });
  });
};


$(document).ready( userPhotoShow() );
$(document).ready(function() {
  //$('#status').text('i am here');
});
