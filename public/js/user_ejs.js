// http://jslint.com/

var YD = {};

(function () {
  //
  // Utilities
  //
  var showStatusMsg = function(data) {
      // 先清除之前的msg内容
      // http://api.jquery.com/empty/
      $( '#msg' ).empty();

      console.log( 'from showStatusMsg, showing each msg: ')
      _.each(data, function (v, k) {
        // http://api.jquery.com/append/
        console.log( k + ': ' + v );
        $('#msg').append(['<div class=', k, '>', v, '</div>'].join(''));
       });
    };

    // 下面两个函数在单独的模版文件中无法使用，报undefined
    var getKey = function (o) { _.keys(o)[0] }
    var getVal = function (o) { _.values(o)[0] }

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
    var renderData = function (url, tpl, cssID, callback) {
    $.get(url)
      .done(function (data) {
        console.log('from renderData, showing callback function');
        console.log(callback);
        //console.log(data, status, xhr)
        var cb = callback || _.identity
        new EJS({url: tpl}).update(cssID, cb(data));
      })
      .fail(function (data, status, xhr) {
        $('#msg').text(data, status, xhr).slideDown('slow');
      })
      .always(function (data, status, xhr) {
        // both sucess and failure
      });
  };

  // 1. get data from form
  // 2. convert data to json
  // 3. post json to api
  // 4. error msg dipsplayed in html
  // for side-effect only
  var postJson = function (url, cssID, callback) {
    var form_data = $(cssID).serializeJSON();
    console.log( 'from postJson, showing post data to ' + url + ': ');
    console.log( form_data );
    $.post(url, form_data)
      .done(function (data) {
        if (!!callback) {
          callback(data);
        }
        showStatusMsg(data);
      })
      .fail(function (data) {
        console.log( data );
        $('#msg').text(data).slideDown('slow');
      })
      .always(function () {
        // console.log( "postJson finished" );
      });
    };


  YD.userShow = function () {
    renderData('/userController/show/loginUser', 'tpl/user_show.ejs', 'user_info', function(d) {
      YD.userInfo = d;
      return d;
    });
  };

  YD.userEdit = function () {
    renderData('/userController/show/loginUser', 'tpl/user_edit.ejs', 'user_info');
  };

  YD.userPhotoShow = function () {
    renderData('/userController/show/loginUser', 'tpl/user_photo.ejs', 'user_photo');
  };

  YD.userPhotoEdit = function () {
    renderData('/userController/photos', 'tpl/user_photo_edit.ejs', 'user_photo', function(d) {
      var n = {};
      n['photos'] = d;
      return n;
    });
  };

  YD.userSave = function () {
    postJson('/userController/save', 'form#user_info', function(data) {
      console.log( 'from YD.userSave, showing post data: ')
      console.log(data)
      if (data.success) {
        YD.userShow();
      };
    });
  };

  YD.userPhotoSave = function () {
    postJson('/userController/save', 'form#user_photo', function(data) {
      console.log( 'from YD.userPhotoSave, showing post data: ')
      console.log(data)
      if (data.success) {
        YD.userPhotoShow();
      };
    });
  };

  YD.startDispache = function () {
    $.get('/examController/show')
      .done(function (data) {
        YD.examInfo = data;
        YD.examCurrent();
        YD.examSimulating();
        YD.examUpcoming();
        YD.examScores();
        //console.log(data);
      })
      .fail(function (data, status, xhr) {
        $('#msg').text(data, status, xhr).slideDown('slow');
      });
  };

  YD.examCurrent = function () {
    if (YD.examInfo.current && !YD.examInfo.scores && !YD.examInfo.upcoming) {
      renderData('/examController/show', 'tpl/start_current_no_score.ejs', 'stack2')
    }
    else if (YD.examInfo.current && !YD.examInfo.upcoming) {
      renderData('/examController/show', 'tpl/start_current_with_score.ejs', 'stack2')
    };
  };

  YD.examSimulating = function () {
    if (!YD.examInfo.scores) {
      renderData('/examController/show', 'tpl/start_simulating.ejs', 'stack1')
    };
  };

  YD.examUpcoming = function () {
    if (YD.examInfo.upcoming) {
      console.log(YD.examInfo.upcoming);
      renderData('/examController/show', 'tpl/start_upcoming.ejs', 'stack2', function (d) {
        upcoming = _.map(YD.examInfo.upcoming, function (e) {
          if (e.today) {
            e.ending_time = '';
            e.today = '今天';
            return e;
          } else {
            e.today = '';
            return e;
          }
        });
        return upcoming;
      });
    };
  };

  YD.examScores = function () {
    if (YD.examInfo.scores) {
      renderData('/examController/show', 'tpl/start_scores.ejs', 'stack1')
    };
  };


}()); // end of let scope
