// Generated by CoffeeScript 1.7.1
(function() {
  var doWhen, hasBlank, note, postJson, redirectToUrl, renderLocalData, root, showStatusMsg, userBar;

  root = typeof global !== "undefined" && global !== null ? global : window;

  if (root.YD == null) {
    root.YD = {};
  }

  YD.debug = false;

  showStatusMsg = function(data) {
    return alert(data.error);
  };

  doWhen = function(predict, action) {
    if (predict) {
      return action();
    }
  };

  postJson = function(url, cssID, callback) {
    var formData, onFailure, onSuccess;
    formData = {
      data: $(cssID).serializeJSON()
    };
    note(formData);
    onSuccess = function(data) {
      if (data != null ? data.error : void 0) {
        return showStatusMsg(data);
      } else {
        return callback();
      }
    };
    onFailure = function(data, status, xhr) {
      return showStatusMsg("" + data + ", " + status + ", " + xhr);
    };
    return $.post(url, formData).done(onSuccess).fail(onFailure);
  };

  renderLocalData = function(data, cssID, tpl, callback) {
    return function() {
      var cb, clonedData;
      cb = callback || _.identity;
      clonedData = _.snapshot(_.extend(data, YD.conf));
      return new EJS({
        url: YD.conf.tplDir + tpl
      }).update(cssID, cb(clonedData));
    };
  };

  redirectToUrl = function(url) {
    return window.location.replace(url);
  };

  note = function(msg) {
    if (YD.debug) {
      return console.log(msg);
    }
  };

  hasBlank = function(arr) {
    var coll, isBlank;
    isBlank = isBlank = function(e) {
      return e === "";
    };
    coll = _.map(arr, isBlank);
    return _.reduce(coll, (function(a, e) {
      return a || e;
    }), false);
  };

  YD.user = function() {
    var userBarShow, userEdit, userInfoAll, userInfoAndPhoto, userPhotoEdit, userPhotoSave, userSave, userShow;
    userInfoAndPhoto = $.when($.ajax(userinfo), $.ajax(photos)).then(function(a, b) {
      var data;
      data = _.extend(a[0], b[0]);
      return data;
    });
    userInfoAll = $.when($.ajax(userinfo), $.ajax(grades), $.ajax(photos)).then(function(a, b, c) {
      return _.extend(a[0], b[0], c[0]);
    });
    userShow = function() {
      return userInfoAndPhoto.then(function(data) {
        return new EJS({
          url: YD.conf.tplDir + "user_show.ejs"
        }).update("user_info", data);
      });
    };
    userBarShow = function() {
      return userInfoAndPhoto.then(function(data) {
        return new EJS({
          url: YD.conf.tplDir + "user_bar.ejs"
        }).update("user_bar", data);
      });
    };
    userEdit = function() {
      return userInfoAll.then(function(data) {
        return new EJS({
          url: YD.conf.tplDir + "user_edit.ejs"
        }).update("user_info", data);
      });
    };
    userPhotoEdit = function() {
      return userInfoAndPhoto.then(function(data) {
        return new EJS({
          url: "" + YD.conf.tplDir + "user_photo_edit.ejs"
        }).update("user_info", data);
      });
    };
    userSave = function() {
      return postJson(YD.conf.userSave, "form#user_info", function() {
        return redirectToUrl(YD.conf.userHomeUrl);
      });
    };
    userPhotoSave = function() {
      return postJson(YD.conf.userSave, "form#user_photo", function() {
        return redirectToUrl(YD.conf.userHomeUrl);
      });
    };
    return (function() {
      userShow();
      userBarShow();
      $("#user_info").delegate("#user_info_edit", "click", userEdit);
      $("#user_info").delegate("#user_photo_edit", "click", userPhotoEdit);
      $("#user_info").delegate("#user_info_save", "click", userSave);
      $("#user_info").delegate("#user_photo_save", "click", userPhotoSave);
      return $("#user_info").delegate("#user_cancel_edit", "click", function() {
        return redirectToUrl(YD.conf.userHomeUrl);
      });
    })();
  };

  YD.userBar = userBar = function() {
    var photos, userInfoAndPhoto, userinfo;
    userinfo = YD.conf.userinfo;
    photos = YD.conf.photos;
    if (YD.userBarShow) {
      return YD.userBarShow();
    } else {
      userInfoAndPhoto = $.when($.ajax(userinfo), $.ajax(photos)).then(function(a, b) {
        var d;
        d = _.extend(a[0], b[0]);
        return d;
      });
      return userInfoAndPhoto.done(function(data) {
        return new EJS({
          url: YD.conf.tplDir + "user_bar.ejs"
        }).update("user_bar", data);
      });
    }
  };

  YD.startDispache = function() {
    var next;
    next = next = function() {
      var getExamInfo, onFailure, onSuccess, promise;
      getExamInfo = $.get(YD.conf.getExamInfo);
      promise = getExamInfo.then(function(data) {
        var updateDateText;
        updateDateText = updateDateText = function(d) {
          var o;
          o = _.map(d.upcomingExam, function(e) {
            if (e.isTodayExam) {
              e.endTime = "";
              e.isTodayExam = "今天";
            } else {
              e.isTodayExam = "";
            }
            return e;
          });
          return {
            upcomingExam: o
          };
        };
        if (data.upcomingExam) {
          _.extend(data, updateDateText(data), {
            hasUpcoming: true
          });
          note(data);
        } else {
          _.extend(data, {
            hasUpcoming: false
          });
        }
        return data;
      });
      note(promise);
      onSuccess = onSuccess = function(data) {
        var TookNoExam, canTakeExam, canTakeExamNolatestExamResult, examInfo, hasResultCanNotRetake, hasResultCanRetake, hasResultCanRetakeContinue, hasUpcomingExam, noExamToTake, render;
        examInfo = _.snapshot(data);
        canTakeExam = (examInfo != null ? examInfo.currentExam : void 0) !== "0" && (examInfo != null ? examInfo.latestExamResult : void 0);
        canTakeExamNolatestExamResult = (examInfo != null ? examInfo.currentExam : void 0) === "0";
        TookNoExam = (examInfo != null ? examInfo.currentExam : void 0) === "0" && (!(examInfo != null ? examInfo.latestExamResult : void 0));
        hasUpcomingExam = (examInfo != null ? examInfo.upcomingExam : void 0) && (!(examInfo != null ? examInfo.latestExamResult : void 0)) && (!(examInfo != null ? examInfo.currentExam : void 0));
        hasResultCanRetake = (examInfo != null ? examInfo.latestExamResult : void 0) && (examInfo != null ? examInfo.currentExam : void 0) && (examInfo != null ? examInfo.currentExam : void 0) === "0";
        hasResultCanRetakeContinue = (examInfo != null ? examInfo.latestExamResult : void 0) && (examInfo != null ? examInfo.currentExam : void 0) && (examInfo != null ? examInfo.currentExam : void 0) !== "0";
        hasResultCanNotRetake = (examInfo != null ? examInfo.latestExamResult : void 0) && (!(examInfo != null ? examInfo.currentExam : void 0));
        noExamToTake = examInfo === {} | (render = _.partial(renderLocalData, examInfo));
        promise.done(doWhen(canTakeExamNolatestExamResult, render("front_content", "start_current_continue.ejs")));
        promise.done(doWhen(canTakeExam, render("front_content", "start_current_continue.ejs")));
        promise.done(doWhen(TookNoExam, render("front_content", "start_current.ejs")));
        promise.done(doWhen(hasUpcomingExam, render("front_content", "start_upcoming.ejs")));
        promise.done(doWhen(hasResultCanRetake, render("front_content", "start_scores.ejs")));
        promise.done(doWhen(hasResultCanRetakeContinue, render("front_content", "start_current_continue.ejs")));
        promise.done(doWhen(hasResultCanNotRetake, render("front_content", "start_scores_cant_retake_exam.ejs")));
        return promise.done(doWhen(noExamToTake, render("front_content", "start_scores_cant_retake_exam.ejs")));
      };
      onFailure = function() {
        return note("链接后台失败。");
      };
      promise.done(function(data) {
        YD.exam = YD.exam || data;
        return note(YD.exam);
      });
      promise.fail(onFailure);
      promise.done(onSuccess);
      return promise.done(function() {
        var shouldRetry;
        shouldRetry = !_.has(YD.exam, "currentExam") && _.has(YD.exam, "upcomingExam") && _.find(YD.exam.upcomingExam, function(e) {
          return e.isTodayExam;
        });
        if (shouldRetry) {
          note("满足刷新条件，页面将会刷新。 " + new Date());
          return setTimeout(next, 180000);
        }
      });
    };
    return setTimeout(next, 0);
  };

  YD.userLogin = function() {
    return $("form").submit(function(e) {
      var name, password, yz;
      e.preventDefault();
      name = $("#username").val();
      password = $("#password").val();
      yz = $("#yz").val();
      if (hasBlank([name, password, yz])) {
        return alert("所有输入框都必须填写。");
      } else {
        $("#password").val($.md5($("#password").val()));
        return postJson(YD.conf.userLogin, "#login", function() {
          return redirectToUrl(YD.conf.siteHomeUrl);
        });
      }
    });
  };

  YD.resetPass = function() {
    return $("#reset_pass_save").click(function(e) {
      var dontMatch, newPass, newPassConfirm, oldPass;
      e.preventDefault();
      oldPass = $("#old_pass").val();
      newPass = $("#new_pass").val();
      newPassConfirm = $("#new_pass_confirm").val();
      dontMatch = newPass !== newPassConfirm;
      if (hasBlank([oldPass, newPass, newPassConfirm])) {
        return alert("所有输入框都必须填写。");
      } else if (dontMatch) {
        return alert("两次输入的新密码不匹配。");
      } else {
        $("#new_pass").val($.md5($("#new_pass").val()));
        $("#old_pass").val($.md5($("#old_pass").val()));
        $("#new_pass_confirm").val($.md5($("#new_pass_confirm").val()));
        return postJson(YD.conf.userResetPass, "#reset_pass_form", function() {
          return redirectToUrl(YD.conf.userHomeUrl);
        });
      }
    });
  };

}).call(this);