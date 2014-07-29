var YD = {};

(function() {
  // function used for side-effect only
  // changing text in html
  var renderData = function(url, tpl, cssID) {
    $.get(url, function(data) {
      new EJS({url: tpl}).update(cssID, data);
    });
  };

  // get data from form
  // convert data to json
  // post json to api
  // error msg dipsplayed in html
  // for side-effect only
  var postJson = function(url, cssID, error_msg, success_msg, complete_msg) {
    var form_data = $(cssID).serializeJSON();
    //alert(form_data);
    $.ajax({
      type: "POST",
      url: url,
      data: form_data,
      error: function() {
        console.log('error brach')
        $('#error').text(error_msg).slideDown('slow');
      },
      success: function(data) {
        console.log('success brach')
        console.log(data);
        if ('error' === data.code) {
          $('#error').text(data.msg).slideDown('slow');
        }
        else {
          $('#success').text(data.msg).slideDown('slow');
          YD.userShow();
        }
      },
      complete: function() {
        $('#status').text(complete_msg).slideDown('slow');;
      }
    });
  }

  var showAjaxError =  function() {
    $('#msg').ajaxError(function(event, request, settings, ex) {
      $(this).html('Error requesting page ' + settings.url + '!');
    });
  };

  YD.userShow = function() {
    renderData(
      '/user/1/show',
      'tpl/user_show.ejs',
      'user_info');
  };

  YD.userEdit = function() {
    renderData(
      '/user/1/show',
      'tpl/user_edit.ejs',
      'user_info');
  };

  YD.userPhotoShow = function() {
    renderData(
      '/user/1/show',
      'tpl/user_photo.ejs',
      'user_photo');
  };

  YD.userPhotoEdit = function() {
    renderData(
      '/user/photos',
      'tpl/user_photo_edit.ejs',
      'user_photo');
  };

  YD.userSave = function() {
    postJson(
      '/user/save',
      'form#user_info',
      '有错！',
      '更新成功了',
      '') ;
    showAjaxError();
  };

  YD.userPhotoSave = function() {
    postJson(
      '/user/save',
      'form#user_photo',
      '有错！',
      '更新成功了',
      '') ;
  };

})();

$(document).ready(function() {
  YD.userShow();
  YD.userPhotoShow();

});
