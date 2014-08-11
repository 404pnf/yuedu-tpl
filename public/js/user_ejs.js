
/*jslint browser: true , nomen: true, indent: 2*/
/*global $, jQuer, EJS, _ */

// http://jslint.com/
// http://www.jslint.com/lint.html
// http://stackoverflow.com/questions/3039587/jslint-reports-unexpected-dangling-character-in-an-underscore-prefixed-variabl

// jslint警告信息中文版
// https://github.com/SFantasy/jslint-error-explanations-zh

var YD = YD || {};


(function () {
  "use strict";

  var showStatusMsg,
    renderData,
    postJson,
    renderLocalData,
    redirectToUrl;

  //
  // Utilities
  //
  showStatusMsg = function (data) {
    // 先清除之前的msg内容
    // http://api.jquery.com/empty/
    $('#msg').empty();

    console.log('from showStatusMsg, showing each msg: ');
    _.each(data, function (v, k) {
      // http://api.jquery.com/append/
      console.log(k + ': ' + v);
      $('#msg').append(['<div class=', k, '>', v, '</div>'].join(''));
    });
  };


  // http://stackoverflow.com/questions/503093/how-can-i-make-a-redirect-page-in-jquery-javascript
  // window.location.replace("http://stackoverflow.com");
  redirectToUrl = function (url) {
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
  renderData = function (url, tpl, cssID, callback) {
    $.get(url)
      .done(function (data) {
        //console.log('from renderData, showing callback function');
        //console.log(callback);
        //console.log(data, status, xhr)
        var cb = callback || _.identity;
        new EJS({url: 'tpl/' + tpl}).update(cssID, cb(data));
      })
      .fail(function (data, status, xhr) {
        $('#msg').text(data, status, xhr).slideDown('slow');
      });
      // .always(function (data, status, xhr) {
      //   // both sucess and failure
      // });
  };


  // 1. get data from form
  // 2. convert data to json
  // 3. post json to api
  // 4. error msg dipsplayed in html
  // for side-effect only
  postJson = function (url, cssID, callback) {
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
        console.log(data);
        $('#msg').text(data).slideDown('slow');
      });
      // .always(function () {
      //   // console.log( "postJson finished" );
      // });
  };

  renderLocalData = function (data, cssID, tpl, isVisable, callback) {
    var cb = callback || _.identity,
      show = isVisable;

    //console.log('show show ' +  show)
    if (show) {
      new EJS({url: 'tpl/' + tpl}).update(cssID, cb(data));
    }
  };


  //
  // user.html 页面
  //

  (function () {

    var userPageInStack1 = _.partial(renderData, '/userController/show/loginUser', _, 'user_info', _),
      userPageInStack2 = _.partial(renderData, '/userController/show/loginUser', _, 'user_photo', _);

    YD.userShow = function () {
      userPageInStack1('user_show.ejs', function (d) {
        YD.userInfo = d;
        return d;
      });
    };

    YD.userEdit = function () {
      userPageInStack1('user_edit.ejs');
    };

    YD.userPhotoShow = function () {
      userPageInStack2('user_photo.ejs');
    };

    YD.userPhotoEdit = function () {
      renderData('/userController/photos', 'user_photo_edit.ejs', 'user_photo', function (d) {
        var n = {};
        n.photos = d;
        return n;
      });
    };

    YD.userSave = function () {
      postJson('/userController/save', 'form#user_info', function (data) {
        console.log('from YD.userSave, showing post data: ');
        console.log(data);
        if (data.success) {
          YD.userShow();
        }
      });
    };

    YD.userPhotoSave = function () {
      postJson('/userController/save', 'form#user_photo', function (data) {
        // console.log( 'from YD.userPhotoSave, showing post data: ')
        // console.log(data)
        if (data.success) {
          YD.userPhotoShow();
        }
      });
    };

  }());

  // 用 partial application 设定一些固定的参数


  // start.html 生成页面的主函数

  YD.startDispache = function () {
    var repeat = function () {
      $.get('/examController/studentLogin')
        .done(function (data) {

          // bind data to local variable
          // predicts
          // 判定时要注意，如果某objec他没有那个键名，我们去取值了，会报 Uncaught ReferenceError: latestExamResult is not defined
          // 这是ejs报的错
          var examInfo = data,
            canTakeExam = !!examInfo.currentExam,
            TookNoExam = canTakeExam && examInfo.currentExam.userExamState === '0',
            hasUpcomingExam = !!examInfo.upcomingExam,
            haslatestExamResult = !!examInfo.latestExamResult,
            showExamSimulating = !haslatestExamResult,
            startPageInStack1,
            startPageInStack2,
            examCurrent,
            examSimulating,
            examUpcoming,
            examScores,
            renderPage;

          // partial application to pre-configure functions
          startPageInStack1 = _.partial(renderLocalData, examInfo, 'stack1');
          startPageInStack2 = _.partial(renderLocalData, examInfo, 'stack2');

          // functions to render page
          // 再测一次看看自己有没有进步？
          // 你有测试尚未完成，可继续测试
          // 你还没有测试。再来测一下
          examCurrent = function () {
            startPageInStack2('start_current.ejs', canTakeExam, function (d) {
              console.log(d);
              var o = _.clone(d.currentExam);
              o = _.extend(o, {button: '开始考试'});
              console.log(o);
              if (haslatestExamResult) {
                o = _.extend(o, {title: '再测一次看看自己有没有进步'});
              } else if (TookNoExam) {
                o = _.extend(o, {title: '你有测试尚未完成，可继续测试'});
              } else {
                o = _.extend(o, {title: '你还没有测试。再来测一下'});
              }
              return o;
            });
          };

          examSimulating = function () {
            startPageInStack1('start_simulating.ejs', showExamSimulating);
          };

          examUpcoming = function () {
            startPageInStack2('start_upcoming.ejs', hasUpcomingExam,  function () {
              var upcomingExam = _.map(examInfo.upcomingExam, function (e) {
                if (e.isTodayExam) {
                  e.endTime = '';
                  e.isTodayExam = '今天';
                } else {
                  e.isTodayExam = '';
                }
                //return e;
              });
              return upcomingExam;
            });
          };

          examScores = function () {
            startPageInStack1('start_scores.ejs', haslatestExamResult);
          };

          // main function
          renderPage = function () {
            _.map(
              [
                examCurrent(),
                examSimulating(),
                examUpcoming(),
                examScores()
              ],
              function (e) {
                e();
              }
            );
          };

          // run repeat once to get data at once
          // then run repeat every n millseconds
          renderPage();
        })
        .fail(function (data, status, xhr) {
          $('#msg').text(data, status, xhr).slideDown('slow');
        });
    };

    return (function () {
      repeat();
      setInterval(repeat, 2000);
    }());
  };

}()); // end of let scope
