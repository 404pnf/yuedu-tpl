var YD = {};

(function() {
  //
  // renderData
  //
  // changing text in html
  // function used for side-effect only
  //
  // @url : uri where json resides
  // @tpl : path to the template failure
  // @cssID : after binding data to tpl, insert the result to cssID
  // @callback : a. massage json data if needed
  //             b. functions for side-effect, i.e, saving tmp data
  //             c. must explicitly return data or massaged data
  var renderData = function(url, tpl, cssID, callback) {
    $.get(url)
      .done(function(data, status, xhr) {
        console.log( 'from renderData, showing callback function' )
        console.log( callback );
        var cb = callback || function (x) { return x };
        new EJS( {url: tpl} ).update( cssID, cb( data ) );
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
    console.log( 'from postJson, showing post data to ' + url + ': ')
    console.log( form_data );
    $.post(url, form_data)
      .done(function(data) {
        if (!!callback) {
          callback(data);
        }
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
      console.log( 'from showStatusMsg, showing each msg: ')
      $.each( data, function( k, v ) {
        // http://api.jquery.com/append/
        console.log( k + ': ' + v )
        // $( '#msg' ).append('<div class=' + k + '>' + v +'</div>' );
        // 我喜欢用Array.join拼字符串，视觉上更干净
        $( '#msg' ).append( ['<div class=', k, '>', v, '</div>'].join('') );
       });
    };

  YD.userShow = function() {
    renderData('/user/show', 'tpl/user_show.ejs', 'user_info', function(d) {
      YD.userInfo = d;
      return d;
    });
  };

  YD.userEdit = function() {
    renderData('/user/show', 'tpl/user_edit.ejs', 'user_info');
  };

  YD.userPhotoShow = function() {
    renderData('/user/show', 'tpl/user_photo.ejs', 'user_photo');
  };

  YD.userPhotoEdit = function() {
    renderData('/user/photos', 'tpl/user_photo_edit.ejs', 'user_photo', function(d) {
      var n = {};
      n['photos'] = d;
      return n;
    });
  };

  YD.userSave = function() {
    postJson('/user/save', 'form#user_info', function(data) {
      console.log( 'from YD.userSave, showing post data: ')
      console.log( data )
      if (data.success) {
        YD.userShow();
      };
    });
  };

  YD.userPhotoSave = function() {
    postJson('/user/save', 'form#user_photo', function(data) {
      console.log( 'from YD.userPhotoSave, showing post data: ')
      console.log( data )
      if (data.success) {
        YD.userPhotoShow();
      };
    });
  };

}()); // end of let scope
