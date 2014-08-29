// ## jslint配置 不要删除
/*jslint browser: true , nomen: true, indent: 2*/
/*global $, jQuery, EJS, _ */

// ## 唯一暴露出来的全局变量。也是程序的命名空间
var YD = YD || {};

// ## 用匿名函数做为 let scope

(function () {
  "use strict";

  var showStatusMsg,
    doWhen,
    postJson,
    renderLocalData,
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
  // **注意：action必须是一个返回函数的函数，这样才能延迟执行**
  doWhen = function (predict, action) {
    if (predict) {
      action();
    }
  };

  // ## 提交表单内容到后台
  //
  // 1. 从表单获取数据
  // 2. 将数据转为json
  // 3. 提交json给后台api
  // 4. 显示错误信息到html，此函数写死在.done里面
  // 5. 如果成功，后台会返回带有'success'键名的对象，此时执行成功时的回调函数
  //
  // TODO
  // 我尝试把这个函数改为 1 使用 promise 2 callback直接用 redirectToUrl 方法定向会用户页面
  // 因为用户页面的默认逻辑就是显示信息
  // 但如果这样，重定向后的页面无法获得post提交后服务器返回的信息，也就无法显示
  // 这是用现在这种纯手工活js而不用框架的限制。
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
  // callback中修改的是数据的深拷贝。使用underscore-contrib中的snapshot方法
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
  YD.user = function () {
    var getUserDataAndCallback,
      userShow,
      userPhotoShow,
      userEdit,
      userPhotoEdit,
      userSave,
      userPhotoSave,
      userinfo = '/userController/show/loginUser',
      grades = '/userController/grades',
      photos = '/userController/photos',
      userInfoAndPhoto,
      userBarShow;

    getUserDataAndCallback = function (tpl, cssID) {
      $.when($.ajax(userinfo), $.ajax(grades), $.ajax(photos)).done(function (a, b, c) {
        // a1 and a2 are arguments resolved for the page1 and page2 ajax requests, respectively.
        // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
        var data = (_.extend(a[0], b[0], c[0]));
        note(data);
        new EJS({url: 'tpl/' + tpl}).update(cssID, data);
      });
    };

    userInfoAndPhoto = $.when($.ajax(userinfo), $.ajax(photos)).then(function (a, b) {
      var data = (_.extend(a[0], b[0]));
      return data
    });

    userShow = function () {
      // $.get(userinfo).done(function (data) {
      //   new EJS({url: 'tpl/' + 'user_show.ejs'}).update('user_info', data);
      // });
      userInfoAndPhoto.then(function (data) {
        new EJS({url: 'tpl/' + 'user_show.ejs'}).update('user_info', data);
      });
    };

    userPhotoShow = function () {
      // $.get(userinfo).done(function (data) {
      //   new EJS({url: 'tpl/' + 'user_photo.ejs'}).update('user_photo', data);
      // });
      userInfoAndPhoto.then(function (data) {
        new EJS({url: 'tpl/' + 'user_photo.ejs'}).update('user_photo', data);
      })
    };

    userBarShow = function () {
      userInfoAndPhoto.then(function (data) {
        new EJS({url: 'tpl/' + 'user_bar.ejs'}).update('user_bar', data);
      })
    };

    userEdit = function () {
      getUserDataAndCallback('user_edit.ejs', 'user_info');
    };

    // 这里不能简化，因为这里不但需要知道总共有多少图片可选还需知道用户当前选的是哪个
    userPhotoEdit = function () {
      getUserDataAndCallback('user_photo_edit.ejs', 'user_photo');
    };

    userSave = function () {
      postJson('/userController/save', 'form#user_info', userShow());
    };

    userPhotoSave = function () {
      postJson('/userController/save', 'form#user_photo', userPhotoShow());
    };


    return (function () {
      // 直接显示用户信息和头像
      userShow();
      userPhotoShow();

      //
      // 通过jQuery的delegate监听尚未出现在页面的元素
      //

      // 编辑用户
      $('#user_info').delegate('#user_info_edit', 'click', userEdit);
      // 编辑头像
      $('#user_photo').delegate('#user_photo_edit', 'click', userPhotoEdit);
      // 保存用户
      $('#user_info').delegate('#user_info_save', 'click', userSave);
      // 保存头像
      $('#user_photo').delegate('#user_photo_save', 'click', userPhotoSave);
    }());
  };
  //
  // ## start.html 生成页面的主函数
  //
  // 每隔一段时间时间查看一下数据源并重新刷新页面。
  YD.startDispache = function () {

    var ajaxInfo =  $.get('/examController/studentLogin'),
      onSuccess,
      onFailure,
      repeat;


    onSuccess = function (data) {

      // 将判定抽象为函数
      var examInfo = _.snapshot(data), // - bind data to local variable
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
    };

    onFailure = function (data, status, xhr) {
      $('#msg').text(data, status, xhr).slideDown('slow');
    };

    repeat = function () {
      ajaxInfo.done(onSuccess).fail(onFailure);
    };

    // TODO
    // self-recursion async call
    // 不是一种好方法，原因见 trevor 的async新书
    // 但暂时不改造，还没有掌握更好的方式
    return (function () {
      repeat();
      // 坑
      // setInterval不接受 repeatCallback()
      // 只能用字符串或变量名
      // 也就是说，其内部用了eval
      // 具体是不是这样需要查书
      setInterval(repeat, 2000);
    }());
  }; // end YD.startDispache

  //
  // ## 登陆页面
  //
  YD.userLogin = function () {
    // highlight
    var elements = $("input[type!='submit'], textarea, select");

    elements.focus(function () {
      $(this).parents('li').addClass('highlight');
    });
    elements.blur(function () {
      $(this).parents('li').removeClass('highlight');
    });

    $("#forgotpassword").click(function () {
      $("#password").removeClass("required");
      $("#login").submit();
      $("#password").addClass("required");
      return false;
    });

    $("#login").validate();

    // 提交表单信息给后台
    $('form').submit(function () {
      postJson('/userController/save', 'form#login');
    });

    //
    // 修改该 jquery validation 插件的报错信息到中文
    //
    // 如需要修改，可在js代码中加入：
    // http://www.open-open.com/lib/view/open1342179346214.html
    //
    //
    jQuery.extend(jQuery.validator.messages, {
      required: "必选字段",
      remote: "请修正该字段",
      email: "请输入正确格式的电子邮件",
      url: "请输入合法的网址",
      date: "请输入合法的日期",
      dateISO: "请输入合法的日期 (ISO).",
      number: "请输入合法的数字",
      digits: "只能输入整数",
      creditcard: "请输入合法的信用卡号",
      equalTo: "请再次输入相同的值",
      accept: "请输入拥有合法后缀名的字符串",
      maxlength: jQuery.validator.format("请输入一个长度最多是 {0} 的字符串"),
      minlength: jQuery.validator.format("请输入一个长度最少是 {0} 的字符串"),
      rangelength: jQuery.validator.format("请输入一个长度介于 {0} 和 {1} 之间的字符串"),
      range: jQuery.validator.format("请输入一个介于 {0} 和 {1} 之间的值"),
      max: jQuery.validator.format("请输入一个最大为 {0} 的值"),
      min: jQuery.validator.format("请输入一个最小为 {0} 的值")
    });

  }; // end YD.userLogin

}()); // end of let scope
