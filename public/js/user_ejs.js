
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
    postJson,
    renderLocalData,
    getUserDataAndCallback,
    redirectToUrl,
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

  // 模仿if (predict) {}，
  // 或者说模仿scheme中的when。
  // action必须是一个返回函数的函数，这样才能延迟执行
  doWhen = function (predict, action) {
    predict && action();
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
        if (_.has(data, 'success') && callbackOnSuccess) {
          callbackOnSuccess();
        }
        showStatusMsg(data);
      })
      .fail(function (data, status, xhr) {
        console.log(data);
        $('#msg').text(data, status, xhr).slideDown('slow');
      });
  };

  // 从局部变量获得数据，绑定模版，插入到html页面中。
  // 可以在使用数据前通过callback修饰数据。
  // callback中修改的是数据的深拷贝。使用jquery的 $.clone(true, dst, src) 。
  // 因此不会影响原始数据。
  // 这里遵守不是自己创建的数据就不应该修改的原则。
  renderLocalData = function (data, cssID, tpl, callback) {
    return function () {
      var cb = callback || _.identity,
        clonedData = _.snapshot(data);
      new EJS({url: 'tpl/' + tpl}).update(cssID, cb(clonedData));
    };
  };

  // 将用户重定向到某页面的正确方式
  redirectToUrl = function (url) {
    window.location.replace(url);
  };

  // 开发时方便发现错误。封装console.log是为了可在需要时候直接用alert替换console.log。
  // 或者加入其它修饰。
  // 这就是function as abstract behavior unit。
  note = function (msg) {
    console.log("NOTE: ");
    console.log(msg);
  };

  //
  // ##  user.html 页面
  //
  // TODO: 没有再用partial函数。这样虽然有很多重复。
  // 但我发现其他同事更好理解。
  // 暂时先这样。

  // 取得用户数据，绑定到模版，显示到html中，再加入需要监听的事件。
  // 因为监听事件的cssID在分开的模版中，开始加载页面的时候去监听是什么都监听不到的。
  // TODO: 这里用了eval。是的， eval is evil 。但我暂时不会其它方法。
  getUserDataAndCallback = function (tpl, cssID, event) {
    var userinfo = '/userController/show/loginUser',
      grades = '/userController/grades',
      photos = '/userController/photos';

    $.when($.ajax(userinfo), $.ajax(grades), $.ajax(photos)).done(function (a, b, c) {
      // a1 and a2 are arguments resolved for the page1 and page2 ajax requests, respectively.
      // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
      var data = (_.extend(a[0], b[0], c[0]));
      note(data);
      new EJS({url: 'tpl/' + tpl}).update(cssID, data);
      event && eval(event);
    });
  };

  YD.userShow = function () {
    getUserDataAndCallback('user_show.ejs', 'user_info', "$('#user_info_edit').on('click', YD.userEdit);");
  };

  YD.userPhotoShow = function () {
    getUserDataAndCallback('user_photo.ejs', 'user_photo', "$('#user_photo_edit').on('click', YD.userPhotoEdit);");
  };

  YD.userEdit = function () {
    getUserDataAndCallback('user_edit.ejs', 'user_info', "$('#user_info_save').on('click', YD.userSave);");
  };

  YD.userPhotoEdit = function () {
    getUserDataAndCallback('user_photo_edit.ejs', 'user_photo', "$('#user_photo_save').on('click', YD.userPhotoSave);");
  };

  YD.userSave = function () {
    postJson('/userController/save', 'form#user_info', YD.userShow);
  };

  YD.userPhotoSave = function () {
    postJson('/userController/save', 'form#user_info', YD.userPhotoShow);
  };

  //
  // ## start.html 生成页面的主函数
  //
  // 每隔一段时间时间查看一下数据源并重新刷新页面。
  YD.startDispache = function () {
    var repeat = function () {
      $.get('/examController/studentLogin')
        .done(function (data) {

          // 将判定抽象为函数
          var examInfo = data, // - bind data to local variable
            canTakeExam = _.has(examInfo, 'currentExam'),
            TookNoExam = canTakeExam && examInfo.currentExam.userExamState === '0',
            hasUpcomingExam = _.has(examInfo, 'upcomingExam'),
            haslatestExamResult = _.has(examInfo, 'latestExamResult'),
            showExamSimulating = !haslatestExamResult,

          // 生成页面的函数
            examCurrent,
            examSimulating,
            examUpcoming,
            examScores;


          // 模拟考试区块
          examSimulating = doWhen(showExamSimulating,
            renderLocalData(examInfo, 'stack1', 'start_simulating.ejs'));

          // 当前考试区块
          examCurrent = doWhen(canTakeExam,
            renderLocalData(examInfo, 'stack2', 'start_current.ejs', function (d) {
              var oo = _.extend(d.currentExam, {button: '开始考试'});

              if (haslatestExamResult) {
                oo = _.extend(oo, {title: '再测一次看看自己有没有进步'});
              } else if (TookNoExam) {
                oo = _.extend(oo, {title: '你还没有测试。来测一下'});
              } else {
                oo = _.extend(oo, {title: '你有测试尚未完成，可继续测试'});
              }
              return oo;
            }));

          // 考试预告区块
          examUpcoming = doWhen(hasUpcomingExam,
            renderLocalData(examInfo, 'stack2', 'start_upcoming.ejs', function (d) {
              // 可以直接修改examInfo。因为得到的数据是原始数据的深拷贝副本。
              // 因此不会影响原始数据。
              // 见 renderLocalData 函数。
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
            }));

          // 考试成绩区块
          examScores = doWhen(haslatestExamResult,
            renderLocalData(examInfo, 'stack1', 'start_scores.ejs'));

          // 渲染整个页面。
          // 对每个函数执行_identity就等于执行了它们。
          _.map(
            [
              examSimulating,
              examCurrent,
              examUpcoming,
              examScores
            ],
            _.identity
          );

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
