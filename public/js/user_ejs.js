// http://jslint.com/

var YD = YD || {};


(function () {

  // work as status tracking accross YD.fn
  // var userInfoEditing = false
  // , userPhotoEditing = false;
  YD.flags = YD.flags || {};
  YD.flags.userInfoEditing = false;
  YD.flags.userPhotoEditing = false;

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
      , getVal = function (o) { _.values(o)[0] }
      // http://stackoverflow.com/questions/503093/how-can-i-make-a-redirect-page-in-jquery-javascript
      // window.location.replace("http://stackoverflow.com");
      , redirectToUrl = function(url) {
        window.location.replace(url);
      };

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

  var renderLocalData = function (data, cssID, tpl, isVisable, callback) {
    var cb = callback || _.identity;
    var show = isVisable;
    //console.log('show show ' +  show)
    if (show) {
      new EJS({url: 'tpl/' + tpl}).update(cssID, cb(data));
    };
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

  YD.userDispache = function () {
    var repeat = function () {
      $.get('/userController/show/loginUser')
      .done(function (data) {
        console.log(data);

        // bind data to local variable
        var userInfo = data;

        // partial application to pre-configure functions
        var stack1 = _.partial(renderLocalData, userInfo, 'stack1')
          , stack2 = _.partial(renderLocalData, userInfo, 'stack2');

        // functions to render page

        var userInfo = function () {
              console.log( 'userInfoEditing status: ' + YD.flags.userInfoEditing);
              stack1('user_show.ejs', !YD.flags.userInfoEditing);
              //stack1('user_show.ejs', false);
            }
          , userPhoto = function () {
              stack2('user_photo.ejs', !YD.flags.userPhotoEditing);
            }
          , userInfoEdit = function () {
            stack1('user_show.ejs', YD.flags.userInfoEditing);
          }
          , userPhotoEdit = function () {
            stack2('user_photo.ejs', YD.flags.userPhotoEditing, function(d) {
              var n = {};
              n['photos'] = d;
              return n;
            });
          };

        // main function
        var renderPage = function () {
          console.log('in rederPage')
          _.map([
            userInfo(),
            userPhoto(),
            userInfoEdit(),
            userPhotoEdit()
            ],
            function (e) { e });
          };
        // run repeat once to get data at once
        // then run repeat every n millseconds
        renderPage();
      })
      .fail(function (data, status, xhr) {
        $('#msg').text(data, status, xhr).slideDown('slow');
      });
    };

    return function () {
      repeat();
      //setInterval(repeat, 12000);
    }();
  };


  YD.userInfoEdit = function () {
    console.log('in userInfoEdit');
    YD.flags.userInfoEditing = true;
    console.log('here in userInfoEdit');
    YD.userDispache();

  }

  YD.userPhotoEdit = function () {
    YD.flags.userPhotoEditing = true;
    YD.userDispache();
  }

  YD.userSave = function () {

    YD.userDispache();

  }

  YD.userPhotoSave = function () {

    YD.userDispache();
  }

  // start.html 生成页面的主函数

  YD.startDispache = function () {
    var repeat = function () {
      $.get('/examController/studentLogin')
      .done(function (data) {

        // bind data to local variable
        var examInfo = data;

        // predicts
        // 判定时要注意，如果某objec他没有那个键名，我们去取值了，会报 Uncaught ReferenceError: latestExamResult is not defined
        // 这是ejs报的错
        var canTakeExam = !!examInfo.currentExam
          , TookNoExam = canTakeExam && examInfo.currentExam.userExamState === '0'
          , hasUpcomingExam = !!examInfo.upcomingExam
          , haslatestExamResult = !!examInfo.latestExamResult
          , showExamSimulating = !haslatestExamResult

        // partial application to pre-configure functions
        var startPageInStack1 = _.partial(renderLocalData, examInfo, 'stack1')
          , startPageInStack2 = _.partial(renderLocalData, examInfo, 'stack2')

        // functions to render page
        // 再测一次看看自己有没有进步？
        // 你有测试尚未完成，可继续测试
        // 你还没有测试。再来测一下
        var examCurrent = function () {
              startPageInStack2('start_current.ejs', canTakeExam, function (d) {
                console.log(d);
                var o = _.clone(d.currentExam);

                o = _.extend(o, {button: '开始考试'});
                console.log(o);
                if (haslatestExamResult) {
                  o = _.extend(o, {title: '再测一次看看自己有没有进步'});
                  return o;
                } else if (TookNoExam) {
                  o = _.extend(o, {title: '你有测试尚未完成，可继续测试'});
                  return o;
                } else {
                  o = _.extend(o, {title: '你还没有测试。再来测一下'});
                  return o;
                }
              })
            }
          , examSimulating = function () {
              startPageInStack1('start_simulating.ejs', showExamSimulating)
            }
          , examUpcoming = function () {
              startPageInStack2('start_upcoming.ejs', hasUpcomingExam,  function (d) {
                                upcomingExam = _.map(examInfo.upcomingExam, function (e) {
                                  if (e.isTodayExam) {
                                    e.endTime = '';
                                    e.isTodayExam = '今天';
                                    return e;
                                  } else {
                                    e.isTodayExam = '';
                                    return e;
                                  }
                                });
                                return upcomingExam;
                              })
            }
          , examScores = function () {
              startPageInStack1('start_scores.ejs', haslatestExamResult);
            };

        // main function
        var renderPage = function () {
          _.map([
            examCurrent(),
            examSimulating(),
            examUpcoming(),
            examScores()
            ],
            function (e) { e });
          };

        // run repeat once to get data at once
        // then run repeat every n millseconds
        renderPage();
      })
      .fail(function (data, status, xhr) {
        $('#msg').text(data, status, xhr).slideDown('slow');
      });
    };

    return function () {
      repeat();
      setInterval(repeat, 12000);
    }();
  };

}()); // end of let scope
