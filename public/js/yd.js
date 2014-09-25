// Generated by CoffeeScript 1.8.0
(function() {
  var alertBox, doWhen, hasBlank, note, postJson, redirectToUrl, renderLocalData, root, showStatusMsg, userBar;

  root = typeof global !== "undefined" && global !== null ? global : window;

  root.YD || (root.YD = {});

  YD.debug = false;

  showStatusMsg = function(data) {
    return alertBox(data.error);
  };

  alertBox = function(msg) {
    $("#msg").text(msg);
    return $("#msg").dialog({
      modal: true,
      buttons: {
        Ok: function() {
          return $(this).dialog("close");
        }
      }
    });
  };

  doWhen = function(predict, action) {
    if (predict) {
      return action;
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
    var grades, photos, userBarShow, userEdit, userInfoAll, userInfoAndPhoto, userPhotoEdit, userPhotoSave, userSave, userShow, userinfo;
    userinfo = YD.conf.userInfo;
    photos = YD.conf.photos;
    grades = YD.conf.grades;
    userInfoAndPhoto = $.when($.ajax(userinfo), $.ajax(photos)).then(function(a, b) {
      return _.extend(a[0], b[0]);
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
    userinfo = YD.conf.userInfo;
    photos = YD.conf.photos;
    if (YD.userBarShow) {
      return YD.userBarShow;
    } else {
      userInfoAndPhoto = $.when($.ajax(userinfo), $.ajax(photos)).then(function(a, b) {
        return _.extend(a[0], b[0]);
      });
      return userInfoAndPhoto.done(function(data) {
        return new EJS({
          url: "" + YD.conf.tplDir + "user_bar.ejs"
        }).update("user_bar", data);
      });
    }
  };

  YD.startDispache = function() {
    var next, updateDateText;
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
    next = next = function() {
      var getExamInfo, onFailure, onSuccess, promise;
      getExamInfo = $.get(YD.conf.getExamInfo);
      promise = getExamInfo.then(function(data) {
        if (data.upcomingExam) {
          _.extend(data, updateDateText(data), {
            hasUpcoming: true
          });
        } else {
          _.extend(data, {
            hasUpcoming: false
          });
        }
        return data;
      });
      note(promise);
      onSuccess = function(data) {
        var cssID, ex0up0res1, ex0up1res0, ex0up1res1, ex1up0res0, ex1up0res1, examInfo, hasCurrentExam, hasUpcomingExam, haslatestExamResult, render, userExamState;
        examInfo = _.snapshot(data);
        examInfo = _.snapshot(data);
        hasCurrentExam = _.has(examInfo, "currentExam");
        hasUpcomingExam = _.has(examInfo, "upcomingExam");
        haslatestExamResult = _.has(examInfo, "latestExamResult");
        userExamState = _.has(examInfo, "currentExam") && examInfo.currentExam.userExamState;
        ex1up0res0 = hasCurrentExam && !haslatestExamResult;
        ex1up0res1 = hasCurrentExam && haslatestExamResult;
        ex0up1res0 = !hasCurrentExam && hasUpcomingExam && !haslatestExamResult;
        ex0up1res1 = !hasCurrentExam && hasUpcomingExam && haslatestExamResult;
        ex0up0res1 = !hasCurrentExam && !hasUpcomingExam && haslatestExamResult;
        render = _.partial(renderLocalData, examInfo);
        cssID = "front_content";
        promise.done(doWhen(ex1up0res0, render(cssID, "start_current.ejs")));
        promise.done(doWhen(ex1up0res1, render(cssID, "start_scores.ejs")));
        promise.done(doWhen(ex0up1res0, render(cssID, "start_upcoming.ejs")));
        promise.done(doWhen(ex0up0res1, render(cssID, "start_scores_with_upcoming.ejs")));
        return promise.done(doWhen(ex0up1res1, render(cssID, "start_scores_with_upcoming.ejs")));
      };
      onFailure = function() {
        return note("链接后台失败。");
      };
      promise.fail(onFailure);
      promise.done(function(data) {
        return note(data);
      });
      promise.done(function(data) {
        return YD.exam = YD.exam || data;
      });
      promise.done(onSuccess);
      return promise.done(function() {
        var shouldRetry;
        shouldRetry = !_.has(YD.exam, "currentExam") && _.has(YD.exam, "upcomingExam") && _.find(YD.exam.upcomingExam, function(e) {
          return e.isTodayExam;
        });
        if (shouldRetry) {
          note("满足刷新条件，页面将会刷新。 " + (new Date()) + " ");
          return setTimeout(next, 180000);
        }
      });
    };
    return setTimeout(next, 0);
  };

  YD.userLogin = function() {
    return $("form").submit(function(e) {
      var name, notValid, password, yz;
      e.preventDefault();
      name = $("#username").val();
      password = $("#password").val();
      yz = $("#yz").val();
      notValid = hasBlank([name, password, yz]);
      if (notValid) {
        return alertBox("所有输入框都必须填写。");
      } else {
        $("#password").val($.md5(password));
        return postJson(YD.conf.userLogin, "#login", function() {
          return redirectToUrl(YD.conf.siteHomeUrl);
        });
      }
    });
  };

  YD.resetPass = function() {
    return $("form").submit(function(e) {
      var dontMatch, newPass, newPassConfirm, notValid, oldPass;
      e.preventDefault();
      oldPass = $("#old_pass").val();
      newPass = $("#new_pass").val();
      newPassConfirm = $("#new_pass_confirm").val();
      dontMatch = newPass !== newPassConfirm;
      notValid = hasBlank([oldPass, newPass, newPassConfirm]);
      if (notValid) {
        return alertBox("所有输入框都必须填写。");
      } else if (dontMatch) {
        return alertBox("两次输入的新密码不匹配。");
      } else {
        $("#new_pass").val($.md5(newPass));
        $("#old_pass").val($.md5(oldPass));
        $("#new_pass_confirm").val($.md5(newPassConfirm));
        return postJson(YD.conf.userResetPass, "#reset_pass_form", function() {
          return redirectToUrl(YD.conf.userHomeUrl);
        });
      }
    });
  };

}).call(this);
