var YD = {};

(function() {
  // 1. changing text in html
  // function used for side-effect only
  var renderData = function(url, tpl, cssID, callback) {
    $.get(url)
      .done(function(data, status, xhr) {
        if (callback) {
          callback(data);
        }
        new EJS({url: tpl}).update(cssID, data);
      })
      .fail(function(data, status, xhr) {
        $('#msg').text(data).slideDown('slow');
      })
      .always(function(data, status, xhr) {
        // both sucess and failure
      });
  };

  // 1. get data from form
  // 2. convert data to json
  // 3. post json to api
  // 4. error msg dipsplayed in html
  // for side-effect only
  var postJson = function(url, cssID, callback) {
    var form_data = $(cssID).serializeJSON();
    //alert(form_data);

    if (callback) {
      callback(form_data);
    }

    $.post(url, form_data)
      .done(function(data) {
        showStatusMsg(data);
      })
      .fail(function(data) {
        console.log( data );
        $('#msg').text(data).slideDown('slow');
      })
      .always(function() {
        // console.log( "postJson finished" );
      });
    };

  var showStatusMsg = function(data) {
      // console.log( "showStatusMsg success" );
      // 先清除之前的msg内容
      // http://api.jquery.com/empty/
      $( '#msg' ).empty();

      // $.each( obj, function( key, value ) {});
      // http://api.jquery.com/jQuery.each/
      $.each( data, function( k, v ) {
        // http://api.jquery.com/append/
        // console.log( k + ': ' + v )
        // $( '#msg' ).append('<div class=' + k + '>' + v +'</div>' );
        // 我喜欢用Array.join拼字符串，视觉上更干净
        $( '#msg' ).append( ['<div class=', k, '>', v, '</div>'].join('') );
       });
    };

  YD.userShow = function() {
    renderData('/user/1/show', 'tpl/user_show.ejs', 'user_info', function(data) {
      YD.userInfo = data;
    });
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
    postJson('/user/save', 'form#user_info', function(data) {
      if (data.sucess) {
        YD.userShow();
      };
    });
  };

  YD.userPhotoSave = function() {
    postJson('/user/save', 'form#user_photo', function(data) {
      if (data.sucess) {
        YD.userPhotoShow();
      };
    });
  };

})(); // end of let scope
