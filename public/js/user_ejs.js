
// ## jslint配置
/*jslint browser: true , nomen: true, indent: 2*/
/*global $, jQuer, EJS, _ */

// ## 唯一暴露出来的全局变量。也是程序的命名空间
var YD = YD || {};

// ## 用匿名函数做为 let scope

(function () {
  "use strict";

  var showStatusMsg,
    doWhen,
    //renderData,
    postJson,
    renderLocalData,
    //redirectToUrl,
    // fail,
    // warn,
    //error,
    note;


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

  doWhen = function (predict, action) {
    if (predict) {
      return action();
    }
  };

  // redirectToUrl = function (url) {
  //   window.location.replace(url);
  // };

  note = function (msg) {
    console.log("NOTE: ");
    console.log(msg);
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

  var getUserDataAndCallback = function (tpl, cssID, event) {
    $.when($.ajax('/userController/show/loginUser'),
      $.ajax("/userController/grades"),
      $.ajax("/userController/photos")).done(function (a, b, c) {
        // a1 and a2 are arguments resolved for the page1 and page2 ajax requests, respectively.
        // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
        var data = (_.extend(a[0], b[0], c[0]));
        note(data);
        new EJS({url: 'tpl/' + tpl}).update(cssID, data);
        if (event) {
          eval(event);
        }
    })
  }
  // ##  user.html 页面

    YD.userShow = function () {
      getUserDataAndCallback('user_show.ejs', 'user_info', "$('#user_info_edit').on('click', YD.userEdit);")
    }

    YD.userPhotoShow = function () {
      getUserDataAndCallback('user_photo.ejs', 'user_photo', "$('#user_photo_edit').on('click', YD.userPhotoEdit);")
    }

    YD.userEdit = function () {
      getUserDataAndCallback('user_edit.ejs', 'user_info', "$('#user_info_save').on('click', YD.userSave);");
    }

    YD.userPhotoEdit = function () {
      getUserDataAndCallback('user_photo_edit.ejs', 'user_photo', "$('#user_photo_save').on('click', YD.userPhotoSave);");
    }

    YD.userSave = function () {
      postJson('/userController/save', 'form#user_info', YD.userShow);
    }

    YD.userPhotoSave = function () {
      postJson('/userController/save', 'form#user_info', YD.userPhotoShow);
    }


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

          note(canTakeExam);
          // 当前考试区块
          examCurrent = doWhen(startPageInStack2('start_current.ejs', function (d) {
            var o = _.clone(d.currentExam);

            o = _.extend(o, {button: '开始考试'});

            if (haslatestExamResult) {
              o = _.extend(o, {title: '再测一次看看自己有没有进步'});
            } else if (TookNoExam) {
              o = _.extend(o, {title: '你还没有测试。来测一下'});
            } else {
              o = _.extend(o, {title: '你有测试尚未完成，可继续测试'});
            }

            return o;
          }), canTakeExam);


          note(hasUpcomingExam);

          // 模拟考试区块
          examSimulating = doWhen(startPageInStack1('start_simulating.ejs'), showExamSimulating);

          //考试预告区块
          examUpcoming = doWhen(startPageInStack2('start_upcoming.ejs', function (d) {
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
          }), hasUpcomingExam);



          //note(haslatestExamResult);
          //note(showExamSimulating);
          // 考试成绩区块
          examScores = doWhen(startPageInStack1('start_scores.ejs'), haslatestExamResult);

          // 渲染页面的主函数
          renderPage = function () {
            _.map(
              [
                examSimulating,
                examCurrent,
                examUpcoming,
                examScores
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
