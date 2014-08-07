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
        //console.log('from renderData, showing callback function');
        //console.log(callback);
        //console.log(data, status, xhr)
        var cb = callback || _.identity
        new EJS({url: 'tpl/' + tpl}).update(cssID, cb(data));
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
    //console.log( 'from postJson, showing post data to ' + url + ': ');
    //console.log( form_data );
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


  //
  // user.html 页面
  //

  // 用 partial application 设定一些固定的参数
  var userPageInStack1 = _.partial(renderData, '/userController/show/loginUser', _, 'user_info', _);
  var userPageInStack2 = _.partial(renderData, '/userController/show/loginUser', _, 'user_photo', _);

  YD.userShow = function () {
    userPageInStack1('user_show.ejs', function(d) {
      YD.userInfo = d;
      return d;
    });
  };

  YD.userEdit = function () { userPageInStack1('user_edit.ejs') };

  YD.userPhotoShow = function () { userPageInStack2('user_photo.ejs') };

  YD.userPhotoEdit = function () {
    renderData('/userController/photos', 'user_photo_edit.ejs', 'user_photo', function(d) {
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
      // console.log( 'from YD.userPhotoSave, showing post data: ')
      // console.log(data)
      if (data.success) {
        YD.userPhotoShow();
      };
    });
  };

  // 用 partial application 设定一些固定的参数
  var startPageInStack1 = _.partial(renderData, '/examController/show', _, 'stack1', _);
  var startPageInStack2 = _.partial(renderData, '/examController/show', _, 'stack2', _);

  YD.startDispache = function () {
    $.get('/examController/show')
      .done(function (data) {
        YD.examInfo = data;
        YD.examCurrent();
        YD.examSimulating();
        YD.examUpcoming();
        YD.examScores();
        console.log(YD.examInfo);
      })
      .fail(function (data, status, xhr) {
        $('#msg').text(data, status, xhr).slideDown('slow');
      });
  };

  YD.examCurrent = function () {
    if (YD.examInfo.current && !YD.examInfo.scores && !YD.examInfo.upcoming) {
      startPageInStack2('start_current_no_score.ejs');
    }
    else if (YD.examInfo.current && !YD.examInfo.upcoming) {
      startPageInStack2('start_current_with_score.ejs');
    };
  };

  YD.examSimulating = function () { startPageInStack1('start_simulating.ejs'); };

  YD.examUpcoming = function () {
    if (YD.examInfo.upcoming) {
      console.log(YD.examInfo.upcoming);
      startPageInStack2('start_current_with_score.ejs', function (d) {
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
      startPageInStack1('start_scores.ejs');
    };
  };

}()); // end of let scope
