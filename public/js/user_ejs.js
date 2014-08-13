
// ## jslint配置
/*jslint browser: true , nomen: true, indent: 2*/
/*global $, jQuer, EJS, _ */

// ## 唯一暴露出来的全局变量。也是程序的命名空间
var YD = YD || {};

// ## 用匿名函数做为 let scope

(function () {
  "use strict";

  var showStatusMsg,
    renderData,
    postJson,
    renderLocalData,
    redirectToUrl,
    fail,
    warn,
    note,
    error;

  //
  // ## 工具函数
  //

  // 先清除之前的msg内容
  showStatusMsg = function (data) {
    $('#msg').empty();
    _.each(data, function (v, k) {
      $('#msg').append(['<div class=', k, '>', v, '</div>'].join(''));
    });
  };


  // http://stackoverflow.com/questions/503093/how-can-i-make-a-redirect-page-in-jquery-javascript
  //
  // window.location.replace("http://stackoverflow.com");
  redirectToUrl = function (url) {
    window.location.replace(url);
  };


    // ## 获取后台数据，绑定到模版并显示在html中
    //
    // 此函数只有副作用。
    //
    // - @url : 从url去json数据
    // - @tpl : 模版文件的izhi
    // - @cssID : 数据绑定模版后应该显示在html中的哪个cssID区块
    // - @callback :
    //    - 在使用前可处理从后台获得的数据
    //    - 执行一些有副作用的函数，如保存后台json到某全局变量
    //    - 不过是否处理后台数据，都需要显性的返回数据，即，最后一样必须是 return data;

  renderData = function (url, tpl, cssID, callback) {
    $.get(url)
      .done(function (data) {
        var cb = callback || _.identity;
        new EJS({url: 'tpl/' + tpl}).update(cssID, cb(data));
      })
      .fail(function (data, status, xhr) {
        $('#msg').text(data, status, xhr).slideDown('slow');
      });
  };

  // 报告错误的帮助函数
  fail = function (msg) {
    throw new Error(msg);
  };

  warn = function (msg) {
    console.log(["WARNING: ", msg].join(''));
  };

  note = function (msg) {
    console.log(["NOTE: ", msg].join(''));
  };

  // ## 提交表单内容到后台
  //
  // 1. 从表单获取数据
  // 2. 将数据转为json
  // 3. 提交json给后台api
  // 4. 显示错误信息到html，此函数写死在.done里面
  // 5. 如果成功，后台会返回带有'success'键名的对象，此时执行成功时的回调函数

  postJson = function (url, cssID, callbackOnSuccess) {
    var form_data = $(cssID).serializeJSON();
    $.post(url, form_data)
      .done(function (data) {
        if (data.success && callbackOnSuccess) {
          callbackOnSuccess();
        }
        showStatusMsg(data);
      })
      .fail(function (data) {
        console.log(data);
        $('#msg').text(data).slideDown('slow');
      });
  };

  // ## 从局部变量中获取数据，绑定到模版并显示在html中
  // 除了变量来源不同，其它和renderData一样
  renderLocalData = function (data, cssID, tpl, isVisable, callback) {
    var cb = callback || _.identity,
      show = isVisable;
    if (show) {
      new EJS({url: 'tpl/' + tpl}).update(cssID, cb(data));
    }
  };


  // ##  user.html 页面

  (function () {

    var userPageInStack1 = _.partial(renderData, '/userController/show/loginUser', _, 'user_info', _),
      userPageInStack2 = _.partial(renderData, '/userController/show/loginUser', _, 'user_photo', _);

    // 显示用户信息
    YD.userShow = function () {
      userPageInStack1('user_show.ejs', function (d) {
        YD.userInfo = d;
        return d;
      });
    };

    // 编辑用户信息
    YD.userEdit = function () {
      userPageInStack1('user_edit.ejs');
    };

    // 显示用户头像
    YD.userPhotoShow = function () {
      userPageInStack2('user_photo.ejs');
    };

    // 编辑用户信息
    //
    // - 年级信息 '/userController/grades'
    // - 头像信息'/userController/photos'
    // - jquery命令 http://api.jquery.com/jQuery.when/
    YD.userEdit = function () {
      $.when($.ajax("/userController/grades"), $.ajax("/userController/photos")).done(function (a1, a2) {
        // a1 and a2 are arguments resolved for the page1 and page2 ajax requests, respectively.
        // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
        var data = _.extend({grades: a1[0]}, {photos: a2[0]}, YD.userInfo);
        note(data);
        renderLocalData(data, 'user_info', 'user_edit.ejs', true);
      });
    };

    // 保存用户信息
    YD.userSave = function () {
      postJson('/userController/save', 'form#user_info', YD.userShow);
    };

    // 保存用户头像
    YD.userPhotoSave = function () {
      postJson('/userController/save', 'form#user_photo', YD.userPhotoShow);
    };

  }());


  // ## start.html 生成页面的主函数
  // 每隔一段时间时间查看一下数据源并重新刷新页面

  YD.startDispache = function () {
    var repeat = function () {
      $.get('/examController/studentLogin')
        .done(function (data) {
          // - 一些判定
          // - 判定时要注意，如果某objec他没有那个键名，我们去取值了，会报 Uncaught ReferenceError: latestExamResult is not defined
          // - 这是ejs报的错
          var examInfo = data, // - bind data to local variable
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

          // 用 partial application 固定一些参数
          startPageInStack1 = _.partial(renderLocalData, examInfo, 'stack1');
          startPageInStack2 = _.partial(renderLocalData, examInfo, 'stack2');

          // 当前考试区块
          examCurrent = function () {
            startPageInStack2('start_current.ejs', canTakeExam, function (d) {
              var o = _.clone(d.currentExam);
              o = _.extend(o, {button: '开始考试'});
              if (haslatestExamResult) {
                o = _.extend(o, {title: '再测一次看看自己有没有进步'});
              } else if (TookNoExam) {
                o = _.extend(o, {title: '你还没有测试。再来测一下'});
              } else {
                o = _.extend(o, {title: '你有测试尚未完成，可继续测试'});
              }
              return o;
            });
          };

          // 模拟考试区块
          examSimulating = function () {
            startPageInStack1('start_simulating.ejs', showExamSimulating);
          };

          // 考试预告区块
          examUpcoming = function () {
            startPageInStack2('start_upcoming.ejs', hasUpcomingExam,  function (d) {
              var o = _.map(d.upcomingExam, function (e) {
                if (e.isTodayExam) {
                  e.endTime = '';
                  e.isTodayExam = '今天';
                } else {
                  e.isTodayExam = '';
                }
                return e;
              });
              return {upcomingExam: o};
            });
          };

          // 考试成绩区块
          examScores = function () {
            startPageInStack1('start_scores.ejs', haslatestExamResult);
          };

          // 渲染页面的主函数
          renderPage = function () {
            _.map(
              [
                examCurrent(),
                examSimulating(),
                examUpcoming(),
                examScores()
              ],
              _.identity
            );
          };

          // 需要先执行渲染页面的函数，
          // 然后再每隔一段时间刷新。
          // 直接调用每隔一段时间刷新的函数，会先等待一段时间才第一次渲染页面。
          renderPage();
          note('又看到我啦。证明页面刷新啦。');
        })
        .fail(function (data, status, xhr) {
          $('#msg').text(data, status, xhr).slideDown('slow');
        });
    };

    // 整个函数的返回值，暴露出来的唯一东西，就是这个匿名函数。哈哈。
    // 处理这个页面的代码还算过得去。
    return (function () {
      repeat();
      setInterval(repeat, 12000);
    }());
  };

}()); // end of let scope
