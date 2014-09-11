// ## jslint配置 不要删除

/*jslint browser: true , devel: true, nomen: true, indent: 2*/
/*global  $, jQuery, EJS, _ */

// ## 唯一暴露出来的全局变量。也是程序的命名空间
var YD;

YD = YD || {};

// ## 用匿名函数做为 let scope

(function () {
  "use strict";

  var conf,
    showStatusMsg,
    doWhen,
    postJson,
    renderLocalData,
    redirectToUrl,
    wrap,
    note;

  // 配置信息
  conf = {
    userHomeUrl: '/personal_info.html',
    tplDir: /tpl/
  };

  //
  // ## 工具函数
  //

  // SIDE-EFFECT ONLY
  showStatusMsg = function (data) {
    // 错误就是一个字符串，获取方法是读取 data.error 的值
    alert(data.error);
  };

  // 模仿if (predict) {}，
  // 或者说模仿scheme中的when。
  // **注意：action必须是一个返回函数的函数，这样才能延迟执行**
  // 可以用后面写的wrap函数包裹一下
  doWhen = function (predict, action) {
    if (predict) {
      action();
    }
  };

  // ## 提交表单内容到后台
  //
  // 1. 从表单获取数据
  // 2. 用jquery插件将数据转为json
  // 3. 提交json给后台api
  // 4. 如果后台返回带"error"的键名的对象，显示错误并停止提交，停留在编辑页面
  // 5. 如果后台会返回带有'success'键名的对象，表示提交成功，执行回调函数
  postJson = function (url, cssID, callback) {
    var form_data,
      onSuccess,
      onFailure;

    form_data = { data: $(cssID).serializeJSON() };
    console.log(form_data);

    onSuccess = function (data) {
      if (_.has(data, 'error')) {
        alert(data.error);
      } else {
        callback();
      }
    };

    onFailure = function (data, status, xhr) {
      showStatusMsg(data + ' ' + status + ' ' + xhr);
    };

    $.post(url, form_data).done(onSuccess).fail(onFailure);

  };

  // 绑定数据到模版并将渲染结果插入到页面
  // 1. SIDE-EFFECT ONLY 做参数使用请包裹在 functin () {} 中
  // 2. 从局部变量获得数据，绑定模版，插入到html页面中。
  // 3. 可以在使用数据前通过callback修饰数据。
  // 4. callback中修改的是数据的深拷贝。使用underscore-contrib中的snapshot方法
  //    因此不会影响原始数据。
  //    这里遵守不是自己创建的数据就不应该修改的原则。
  renderLocalData = function (data, cssID, tpl, callback) {
    return function () {
      var cb = callback || _.identity,
        clonedData = _.snapshot(data);
      new EJS({url: 'tpl/' + tpl}).update(cssID, cb(clonedData));
    };
  };

  redirectToUrl = function (url) {
    window.location.replace(url);
  };

  // 包裹那些有副作用的函数，防止它们在作为参数的时候先被求值了
  wrap = function wrap(func) {
    return function () {
      func();
    };
  };

  note = function (msg) {
    console.log("NOTE: ");
    console.log(msg);
  };

  //
  // ##  user.html 页面
  //
  YD.user = function () {
    var userShow,
      userEdit,
      userPhotoEdit,
      userSave,
      userPhotoSave,
      userinfo = '/userController/show/loginUser',
      grades = '/userController/grades',
      photos = '/userController/photos',
      userInfoAndPhoto,
      userBarShow,
      userInfoAll;

    userInfoAndPhoto = $.when($.ajax(userinfo), $.ajax(photos)).then(function (a, b) {
      var data = (_.extend(a[0], b[0]));
      return data;
    });

    userInfoAll = $.when($.ajax(userinfo), $.ajax(grades), $.ajax(photos)).then(function (a, b, c) {
      // a1 and a2 are arguments resolved for the page1 and page2 ajax requests, respectively.
      // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
      var data = (_.extend(a[0], b[0], c[0]));
      return data;
    });

    userShow = function () {
      userInfoAndPhoto.then(function (data) {
        new EJS({url: 'tpl/' + 'user_show.ejs'}).update('user_info', data);
      });
    };

    userBarShow = function () {
      userInfoAndPhoto.then(function (data) {
        new EJS({url: 'tpl/' + 'user_bar.ejs'}).update('user_bar', data);
      });
    };

    // 为了让其它页面也能直接调页面通用的用户信息条
    YD.userBarShow = userBarShow;

    userEdit = function () {
      userInfoAll.then(function (data) {
        new EJS({url: 'tpl/' + 'user_edit.ejs'}).update('user_info', data);
      });
    };

    // 这里不能简化，因为这里不但需要知道总共有多少图片可选还需知道用户当前选的是哪个
    userPhotoEdit = function () {
      userInfoAndPhoto.then(function (data) {
        new EJS({url: 'tpl/' + 'user_photo_edit.ejs'}).update('user_info', data);
      });
    };

    userSave = function () {
      postJson('/userController/save', 'form#user_info', wrap(userSave));
    };

    userPhotoSave = function () {
      postJson('/userController/save', 'form#user_info', wrap(userShow));
    };

    return (function () {
      // 直接显示用户信息和头像
      userShow();
      userBarShow();

      //
      // 通过jQuery的delegate监听尚未出现在页面的元素
      //

      // 编辑用户
      $('#user_info').delegate('#user_info_edit', 'click', userEdit);
      // 编辑头像
      $('#user_info').delegate('#user_photo_edit', 'click', userPhotoEdit);
      // 保存用户
      $('#user_info').delegate('#user_info_save', 'click', userSave);
      // 保存头像
      $('#user_info').delegate('#user_photo_save', 'click', userPhotoSave);
      // 监听取消编辑用户信息和取消编辑用户头像信息的按钮；
      // 这里不能用wrap，因为 redirect(conf.userHomeUrl) 作为参数传给 wrap 时已经被求值
      // 即副作用redirect已经起作用了
      $('#user_info').delegate('#user_cancel_edit', 'click', function () { redirectToUrl(conf.userHomeUrl) });
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
      var userinfo = '/userController/show/loginUser',
        photos = '/userController/photos',
        userInfoAndPhoto,
        userBarShow,

      // 将判定抽象为函数
        examInfo = _.snapshot(data), // - data 是 onSuccess 的参数； bind data to local variable
        canTakeExam = _.has(examInfo, 'currentExam') && examInfo.currentExam.userExamState !== '0' && !(_.has(examInfo, 'latestExamResult')),
        TookNoExam = canTakeExam && examInfo.currentExam.userExamState === '0' && !(_.has(examInfo, 'latestExamResult')),
        hasUpcomingExam = _.has(examInfo, 'upcomingExam') && !_.has(examInfo, 'latestExamResult') && !_.has(examInfo, 'currentExam'),
        hasResultCanRetake = _.has(examInfo, 'latestExamResult') && _.has(examInfo, 'currentExam'),
        hasResultCanNotRetake = _.has(examInfo, 'latestExamResult') && !(_.has(examInfo, 'currentExam')),

      // 生成页面的函数
        examCurrent,
        examUpcoming,
        examCurrent_continue,
        examScores,
        examScoresCantRetake,

        // 帮助函数
        updateDateText;

      // 有之前未完成考试
      examCurrent_continue = doWhen(canTakeExam,
        renderLocalData(examInfo, 'front_content', 'start_current_continue.ejs'));

      // 有新考试可考
      examCurrent = doWhen(TookNoExam,
        renderLocalData(examInfo, 'front_content', 'start_current.ejs'));

      updateDateText = function (d) {
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
      };

      // 考试预告区块
      examUpcoming = doWhen(hasUpcomingExam,
        renderLocalData(examInfo, 'front_content', 'start_upcoming.ejs', updateDateText));

      // 考试成绩区块
      examScores = doWhen(hasResultCanRetake,
        renderLocalData(examInfo, 'front_content', 'start_scores.ejs'));

      // 有成绩，但无currentExam，可能有upcommings，可能没有
      examScoresCantRetake = doWhen(hasResultCanNotRetake,
        renderLocalData(examInfo, 'front_content', 'start_scores_cant_retake_exam.ejs', function (d) {
          var hasUpcoming = _.has(examInfo, 'upcomingExam');
          return _.merge(d, {hasUpcoming: hasUpcoming}, updateDateText(d)); // 告诉模版没有upcomingExam区块
        }));

      // 用户条
      userInfoAndPhoto = $.when($.ajax(userinfo), $.ajax(photos)).then(function (a, b) {
        var d = (_.extend(a[0], b[0])); // 这里如果也用data，会shadow函数onSuccess的输入，虽然不是错误，但避免吧
        return d;
      });

      userBarShow = userInfoAndPhoto.then(function (data) {
        new EJS({url: 'tpl/' + 'user_bar.ejs'}).update('user_bar', data);
      });

      // 渲染整个页面。
      // 对每个函数执行_identity就等于执行了它们。
      _.map(
        [
          userBarShow,
          examCurrent,
          examCurrent_continue,
          examUpcoming,
          examScores,
          examScoresCantRetake
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
      // 只能用字符串或变量名，且不能有括号！
      // 也就是说，其内部用了eval
      // 具体是不是这样需要查书
      //
      // TODO 在 safari中不起作用！
      // 就是说虽然每几秒执行一次函数
      // 但是后台数据变了页面并不帅新
      // 需要按ctrl - r 刷新
      // chrome中就自动刷新
      setInterval(repeat, 20000); // 单位是毫秒
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

    //
    // 修改该 jquery validation 插件的报错信息到中文
    //
    // 如需要修改，可在js代码中加入：
    // http://www.open-open.com/lib/view/open1342179346214.html
    //
    jQuery.extend(jQuery.validator.messages, {
      required: "必填字段",
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

    return (function () {
      // 提交表单
      $('form').submit(function (e) {
        e.preventDefault();
        postJson('/userController/login', 'form#login', function () {
          redirectToUrl('/front.html');
        });
      });
    }());

  }; // end YD.userLogin

}()); // end of let scope
