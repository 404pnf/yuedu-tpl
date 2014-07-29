var YD = {};

(function() {
  // function used for side-effect only
  // changing text in html
  var renderData = function(url, tpl, cssID) {
    $.get(url)
      .done(function(data, status, xhr) {
        new EJS({url: tpl}).update(cssID, data);
        if ('error' == data.code) {
          $('#error').text(data.msg).slideDown('slow');
        }
        else {
          $('#success').text(data.msg).slideDown('slow');
        }
      })
      .fail(function(data, status, xhr) {
        $('#error').text(data).slideDown('slow');
      })
      .always(function(data, status, xhr) {
        // both sucess and failure
      });
  };

  // get data from form
  // convert data to json
  // post json to api
  // error msg dipsplayed in html
  // for side-effect only
  var postJson = function(url, cssID) {
    var form_data = $(cssID).serializeJSON();
    //alert(form_data);
    $.post(url, form_data)
      .done(function(data) {
        //alert( "success" );
        if ('error' == data.code) {
          $('#error').text(data.msg).slideDown('slow');
        }
        else {
          $('#success').text(data.msg).slideDown('slow');
        }
      })
      .fail(function() {
        //alert( "error" );
      })
      .always(function() {
        //alert( "finished" );
      });
    };

  var showAjaxError =  function() {
    $('#msg').ajaxError(function(event, request, settings, ex) {
      $(this).html('Error requesting page ' + settings.url + '!');
    });
  };

  YD.userShow = function() {
    renderData('/user/1/show', 'tpl/user_show.ejs', 'user_info');
  };

  YD.userEdit = function() {
    renderData('/user/1/show', 'tpl/user_edit.ejs', 'user_info');
  };

  YD.userPhotoShow = function() {
    renderData('/user/1/show', 'tpl/user_photo.ejs', 'user_photo');
  };

  YD.userPhotoEdit = function() {
    renderData('/user/photos', 'tpl/user_photo_edit.ejs', 'user_photo');
  };

  YD.userSave = function() {
    postJson('/user/save', 'form#user_info') ;
  };

  YD.userPhotoSave = function() {
    postJson('/user/save', 'form#user_photo') ;
  };

})(); // end of let scope

$(document).ready(function() {
  YD.userShow();
  YD.userPhotoShow();
});
