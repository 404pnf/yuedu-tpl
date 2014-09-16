// ## jslint配置 不要删除
// 星号和斜杠，指令间不要有空格
/*jslint browser: true , devel: true, nomen: true, indent: 2*/
/*global $, jQuery, EJS, _, alert, console, setInterval, window, setTimeout*/

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
    userHomeUrl: "/personal_info.html",
    tplDir: /tpl/
  };

  //
  // ## 工具函数
  //

  // SIDE-EFFECT ONLY
  showStatusMsg = function showStatusMsg(data) {
    // 错误就是一个字符串，获取方法是读取 data.error 的值
    alert(data.error);
  };

  // 模仿if (predict) {}，
  // 或者说模仿scheme中的when。
  // **注意：action必须是一个返回函数的函数，这样才能延迟执行**
  // 可以用后面写的wrap函数包裹一下
  doWhen = function doWhen(predict, action) {
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
  // 5. 如果后台会返回带有"success"键名的对象，表示提交成功，执行回调函数
  postJson = function postJson(url, cssID, callback) {
    var formData,
      onSuccess,
      onFailure;

    formData = { data: $(cssID).serializeJSON() };
    console.log(formData);

    onSuccess = function onSuccess(data) {
      if (_.has(data, "error")) {
        //showStatusMsg(data.error);
        alert(data.error);
      } else {
        callback();
      }
    };

    onFailure = function onFailure(data, status, xhr) {
      showStatusMsg(data + " " + status + " " + xhr);
    };

    $.post(url, formData).done(onSuccess).fail(onFailure);

  };

  // 绑定数据到模版并将渲染结果插入到页面
  // 1. SIDE-EFFECT ONLY 做参数使用请包裹在 functin () {} 中
  // 2. 从局部变量获得数据，绑定模版，插入到html页面中。
  // 3. 可以在使用数据前通过callback修饰数据。
  // 4. callback中修改的是数据的深拷贝。使用underscore-contrib中的snapshot方法
  //    因此不会影响原始数据。
  //    这里遵守不是自己创建的数据就不应该修改的原则。
  renderLocalData = function renderLocalData(data, cssID, tpl, callback) {
    return function () {
      var cb = callback || _.identity,
        clonedData = _.snapshot(data);
      new EJS({url: conf.tplDir + tpl}).update(cssID, cb(clonedData));
    };
  };

  redirectToUrl = function redirectToUrl(url) {
    window.location.replace(url);
  };

  // 包裹那些有副作用的函数，防止它们在作为参数的时候先被求值了
  wrap = function wrap(func) {
    return function () {
      func();
    };
  };

  note = function note(msg) {
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
      userinfo = "/userController/show/loginUser",
      grades = "/userController/grades",
      photos = "/userController/photos",
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

    userShow = function userShow() {
      userInfoAndPhoto.then(function (data) {
        new EJS({url: conf.tplDir + "user_show.ejs"}).update("user_info", data);
      });
    };

    userBarShow = function userBarShow() {
      userInfoAndPhoto.then(function (data) {
        new EJS({url: conf.tplDir + "user_bar.ejs"}).update("user_bar", data);
      });
    };

    userEdit = function userEdit() {
      userInfoAll.then(function (data) {
        new EJS({url: conf.tplDir + "user_edit.ejs"}).update("user_info", data);
      });
    };

    // 这里不能简化，因为这里不但需要知道总共有多少图片可选还需知道用户当前选的是哪个
    userPhotoEdit = function userPhotoEdit() {
      userInfoAndPhoto.then(function (data) {
        new EJS({url: conf.tplDir + "user_photo_edit.ejs"}).update("user_info", data);
      });
    };

    userSave = function userSave() {
      postJson("/userController/save", "form#user_info", wrap(userSave));
    };

    userPhotoSave = function userPhotoSave() {
      postJson("/userController/save", "form#user_info", wrap(userShow));
    };


    return (function () {
      // 直接显示用户信息和头像
      userShow();
      userBarShow();

      //
      // 通过jQuery的delegate监听尚未出现在页面的元素
      //

      // 编辑用户
      $("#user_info").delegate("#user_info_edit", "click", userEdit);
      // 编辑头像
      $("#user_info").delegate("#user_photo_edit", "click", userPhotoEdit);
      // 保存用户
      $("#user_info").delegate("#user_info_save", "click", userSave);
      // 保存头像
      $("#user_info").delegate("#user_photo_save", "click", userPhotoSave);
      // 监听取消编辑用户信息和取消编辑用户头像信息的按钮；
      // 这里不能用wrap，因为 redirect(conf.userHomeUrl) 作为参数传给 wrap 时已经被求值
      // 即副作用redirect已经起作用了
      $("#user_info").delegate("#user_cancel_edit", "click", function () {
        redirectToUrl(conf.userHomeUrl);
      });
    }());
  };

  //
  // ## start.html 生成页面的主函数
  //
  // 每隔一段时间时间查看一下数据源并重新刷新页面。
  YD.startDispache = function () {

    var ajaxInfo =  $.get("/examController/studentLogin"),
      promise,
      onSuccess,
      onFailure,
      refreshPage,
      repeat;

    // 直接渲染用户条
    (function () {
      var userinfo = "/userController/show/loginUser",
        photos = "/userController/photos",
        userInfoAndPhoto;

      if (YD.userBarShow) {
        note("from YD");
        YD.userBarShow();
      } else {
        note("re-render userBar");
        // 用户条
        userInfoAndPhoto = $.when($.ajax(userinfo), $.ajax(photos)).then(function (a, b) {
          var d = (_.extend(a[0], b[0])); // 这里如果也用data，会shadow函数onSuccess的输入，虽然不是错误，但避免吧
          return d;
        });

        userInfoAndPhoto.done(function (data) {
          new EJS({url: conf.tplDir + "user_bar.ejs"}).update("user_bar", data);
        });
      }
    }());

    promise = ajaxInfo.then(function (data) {
      var updateDateText = function updateDateText(d) {
        var o = _.map(d.upcomingExam, function (e) {
          if (e.isTodayExam) {
            e.endTime = "";
            e.isTodayExam = "今天";
          } else {
            e.isTodayExam = "";
          }
          return e;
        });

        return {upcomingExam: o};
      };

      // 一次性将数据处理好
      if (data.upcomingExam) {
        _.extend(data, updateDateText(data), {hasUpcoming: true}); // 直接修改了examInfo
        note(data);
      } else {
        _.extend(data, {hasUpcoming: false});
      }
      return data;
    });

    note(promise);

    onSuccess = function onSuccess(data) {
      // 将判定抽象为函数

          // 将从后台获得的数据（从onSuccess函数的参数传进来）绑定到局部变量
      var examInfo = _.snapshot(data),

        // 有考试，学生状态为未考，有上次考试成绩  有currentExam， userExamState = 0 但无 latestExamResult
        canTakeExam = _.has(examInfo, "currentExam") && examInfo.currentExam.userExamState !== "0" && !(_.has(examInfo, "latestExamResult")),

        // 有考试，无上次考试成绩，无考试预告
        canTakeExamNolatestExamResult = _.has(examInfo, "currentExam"),

        // 有考试，学生状态为未考，无上次考试成绩
        TookNoExam = canTakeExam && examInfo.currentExam.userExamState === "0"  && !(_.has(examInfo, "latestExamResult")),

        // 有考试预告  有upcomingExam, 但无 latestExamResult , 无 currentExam ；防止和后面的冲突
        hasUpcomingExam = _.has(examInfo, "upcomingExam") && !_.has(examInfo, "latestExamResult") && !_.has(examInfo, "currentExam"),

        // 有成绩，可重测   有 latestExamResult 有 curerntExam
        hasResultCanRetake = _.has(examInfo, "latestExamResult") && _.has(examInfo, "currentExam"),

        // 有成绩，不可重测，有考试预告   有 latestExamResult 但无 curerntExam， 有 upcomingExam
        hasResultCanNotRetake = _.has(examInfo, "latestExamResult") && !(_.has(examInfo, "currentExam")),

        // 无考试，无考试预告，无上次成绩
        noExamToTake = !_.has(examInfo, "currentExam"),

      // 生成页面的函数
        examCurrent,
        examCurrentNoResulat,
        examUpcoming,
        examCurrentContinue,
        examScores,
        examScoresCantRetake,

        // 帮助函数
        // updateDateText,
        render;

      // updateDateText = function updateDateText(d) {
      //   var o = _.map(d.upcomingExam, function (e) {
      //     if (e.isTodayExam) {
      //       e.endTime = "";
      //       e.isTodayExam = "今天";
      //     } else {
      //       e.isTodayExam = "";
      //     }
      //     return e;
      //   });

      //   return {upcomingExam: o};
      // };

      // // 一次性将数据处理好
      // if (examInfo.upcomingExam) {
      //   _.extend(examInfo, updateDateText(examInfo), {hasUpcoming: true}); // 直接修改了examInfo
      //   note(examInfo);
      // } else {
      //   _.extend(examInfo, {hasUpcoming: false});
      // }

      render = _.partial(renderLocalData, examInfo);

      // 之前未考过任何考试，因此无latestResult，当前有考试
      examCurrentNoResulat = doWhen(canTakeExamNolatestExamResult, render("front_content", "start_current_continue.ejs"));

      // 有之前未完成考试
      examCurrentContinue = doWhen(canTakeExam, render("front_content", "start_current_continue.ejs"));

      // 有新考试可考
      examCurrent = doWhen(TookNoExam, render("front_content", "start_current.ejs"));

      // 考试预告区块
      examUpcoming = doWhen(hasUpcomingExam, render("front_content", "start_upcoming.ejs"));

      // 考试成绩区块
      examScores = doWhen(hasResultCanRetake, render("front_content", "start_scores.ejs"));

      // 有成绩，但无currentExam，可能有upcommings，可能没有
      examScoresCantRetake = doWhen(hasResultCanNotRetake, render("front_content", "start_scores_cant_retake_exam.ejs"));

      // 渲染整个页面。
      // 对每个函数执行_identity就等于执行了它们。
      // TODO:  注意： 顺序是有关系的！
      _.map(
        [
          examCurrent,
          examCurrentNoResulat,
          examCurrentContinue,
          examUpcoming,
          examScores,
          examScoresCantRetake
        ],
        _.identity
      );

      note("又看到我啦。证明页面刷新啦。 " + new Date());


      YD.cache = examInfo;
      // 给后续 .then 函数使用的值
      return noExamToTake;
    };

    onFailure = function onFailure(data, status, xhr) {
      showStatusMsg(data + status + xhr);
    };

    // 让浏览器刷新页面的函数
    refreshPage = function refreshPage(pred) {
      // if (pred) {
      //   ajaxInfo.then(function (data) {
      //     //var eql = _.isEqual(data, YD.cache);
      //     setTimeout(repeat, 15000);
      //   });
      //   // setTimeout(function () {
      //   //   window.location.reload(1);
      //   // }, 60000);
      // }
    };

    repeat = function repeat() {
      ajaxInfo.then(onSuccess, onFailure).then(refreshPage);
    };

    return (function () {
      repeat();
    }());
  }; // end YD.startDispache

  //
  // ## 登陆页面
  //
  YD.userLogin = function () {
    // NB: in JS, empty string is false
    // '' is false
    // ' ' with a space is true
    var validValue;

    $("form").submit(function (e) {
      e.preventDefault();

      validValue = _.reduce(["#password", "#username", "#yz"],
        function (a, e) {
          return (a && $(e).val());
        },
        true);

      console.log(validValue);

      if (validValue) {
        postJson("/userController/login", "form#login", function () {
          wrap(redirectToUrl("/front.html"));
        });
      } else {
        alert("所有输入框都必须填写。");
      }
    });
  }; // end YD.userLogin

}()); // end of let scope
