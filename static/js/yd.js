// Generated by CoffeeScript 1.8.0
(function() {
  var alertBox, doWhen, hasBlank, howManyDays, note, postHelper, postJson, redirectToUrl, renderLocalData, root, showStatusMsg;

  root = typeof global !== "undefined" && global !== null ? global : window;

  if (root.YD == null) {
    root.YD = {};
  }

  YD.debug = true;

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
      if ("error" in data) {
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

  postHelper = function(url, data, callback) {
    var onFailure, onSuccess;
    note(data);
    onSuccess = function(data) {
      if ("error" in data) {
        return showStatusMsg(data);
      } else {
        return callback();
      }
    };
    onFailure = function(data, status, xhr) {
      return showStatusMsg("" + data + ", " + status + ", " + xhr);
    };
    return $.post(url, data).done(onSuccess).fail(onFailure);
  };

  renderLocalData = function(data, cssID, tpl, callback) {
    return function() {
      var cb, clonedData;
      cb = callback || _.identity;
      clonedData = _.snapshot(_.extend(data, YD.conf));
      return new EJS({
        url: "" + YD.conf.tplDir + tpl
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

  hasBlank = function(arrayOfCssElement) {
    var e, isBlank, notValid, _i, _len;
    notValid = false;
    isBlank = function(e) {
      return e === "" || e.replace(/^\s+|\s+$/g, "") === "";
    };
    for (_i = 0, _len = arrayOfCssElement.length; _i < _len; _i++) {
      e = arrayOfCssElement[_i];
      if (isBlank($(e).val())) {
        $(e).addClass("error");
        notValid = true;
      }
    }
    return notValid;
  };

  howManyDays = function(year, month) {
    var days, isFeb, isLeap, lunarMonth, solarMonth;
    isLeap = year === 2004 || year === 2008 || year === 2012 || year === 2016 || year === 2020;
    solarMonth = month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12;
    lunarMonth = month === 4 || month === 6 || month === 9 || month === 11;
    isFeb = month === 2;
    return days = isLeap && isFeb ? 29 : isFeb ? 28 : lunarMonth ? 30 : 31;
  };

  YD.user = function() {
    var buildDays, grades, photos, setDaysOfMonth, userBarShow, userEdit, userInfoAll, userPhotoEdit, userPhotoSave, userRender, userSave, userShow, userinfo;
    userinfo = YD.conf.userInfo;
    photos = YD.conf.photos;
    grades = YD.conf.grades;
    userInfoAll = $.when($.get(userinfo), $.get(grades), $.get(photos)).then(function(a, b, c) {
      return _.extend(a[0], b[0], c[0]);
    }).then(function(d) {
      var days;
      days = howManyDays(d.year, d.month);
      return _.extend(d, d.days = days);
    });
    userRender = function(tpl, cssID, data) {
      return new EJS({
        url: YD.conf.tplDir + tpl
      }).update(cssID, data);
    };
    userShow = function() {
      return userInfoAll.done(function(data) {
        return userRender("student/user_show.ejs", "user_info", data);
      });
    };
    userBarShow = function() {
      return userInfoAll.done(function(data) {
        return userRender("student/user_bar.ejs", "user_bar", data);
      });
    };
    userEdit = function() {
      return userInfoAll.done(function(data) {
        note(data);
        return userRender("student/user_edit.ejs", "user_info", data);
      });
    };
    buildDays = function() {
      var buildOptions, day, days, month, year;
      year = parseInt($("#year").val(), 10);
      month = parseInt($("#month").val(), 10);
      day = parseInt($("#day").val(), 10);
      note("" + year + ", " + month);
      days = howManyDays(year, month);
      buildOptions = function(n) {
        var res;
        res = _.reduce(_.range(1, n + 1), function(a, e) {
          return a += "<option value=" + e + ">" + e + "</option>";
        }, "<option value='-1'>日</option>");
        return $("#day").html(res);
      };
      return buildOptions(days);
    };
    setDaysOfMonth = function() {
      return buildDays();
    };
    userPhotoEdit = function() {
      return userInfoAll.done(function(data) {
        return userRender("student/user_photo_edit.ejs", "user_info", data);
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
      $("#user_info").delegate(".monitor", "change", setDaysOfMonth);
      $("#user_info").delegate("#user_photo_edit", "click", userPhotoEdit);
      $("#user_info").delegate("#user_info_save", "click", userSave);
      return $("#user_info").delegate("#user_photo_save", "click", userPhotoSave);
    })();
  };

  YD.userBar = function() {
    var photos, userinfo;
    userinfo = YD.conf.userInfo;
    photos = YD.conf.photos;
    return $.when($.get(userinfo), $.get(photos)).then(function(a, b) {
      return _.extend(a[0], b[0]);
    }).done(function(data) {
      return new EJS({
        url: "" + YD.conf.tplDir + "student/user_bar.ejs"
      }).update("user_bar", data);
    });
  };

  YD.startDispache = function() {
    var next, updateDateText;
    updateDateText = function(d) {
      var o;
      return o = _.map(d.upcomingExam, function(e) {
        if (e.isTodayExam) {
          e.endTime = "";
          return e.isTodayExam = "今天";
        } else {
          return e.isTodayExam = "";
        }
      });
    };
    next = function() {
      var getExamInfo, onFailure, onSuccess, promise;
      getExamInfo = $.get(YD.conf.getExamInfo);
      promise = getExamInfo.then(function(data) {
        if ("upcomingExam" in data) {
          return _.extend(data, updateDateText(data), {
            hasUpcoming: true
          });
        } else {
          return _.extend(data, {
            hasUpcoming: false
          });
        }
      });
      note(promise);
      onSuccess = function(data) {
        var cssID, ex0up0res1, ex0up1res0, ex0up1res1, ex1up0res0, ex1up0res1, examInfo, hasCurrentExam, hasUpcomingExam, haslatestExamResult, render, userExamState, _ref;
        examInfo = _.snapshot(data);
        hasCurrentExam = "currentExam" in examInfo;
        hasUpcomingExam = "upcomingExam" in examInfo;
        haslatestExamResult = "latestExamResult" in examInfo;
        userExamState = (_ref = examInfo.currentExam) != null ? _ref.userExamState : void 0;
        ex1up0res0 = hasCurrentExam && !haslatestExamResult;
        ex1up0res1 = hasCurrentExam && haslatestExamResult;
        ex0up1res0 = !hasCurrentExam && hasUpcomingExam && !haslatestExamResult;
        ex0up1res1 = !hasCurrentExam && hasUpcomingExam && haslatestExamResult;
        ex0up0res1 = !hasCurrentExam && !hasUpcomingExam && haslatestExamResult;
        cssID = "front_content";
        render = _.partial(renderLocalData, examInfo, cssID);
        promise.done(doWhen(ex1up0res0, render("student/start_current.ejs")));
        promise.done(doWhen(ex1up0res1, render("student/start_scores.ejs")));
        promise.done(doWhen(ex0up1res0, render("student/start_upcoming.ejs")));
        promise.done(doWhen(ex0up0res1, render("student/start_scores_with_upcoming.ejs")));
        return promise.done(doWhen(ex0up1res1, render("student/start_scores_with_upcoming.ejs")));
      };
      onFailure = function(data, status, xhr) {
        return showStatusMsg("" + data + ", " + status + ", " + xhr);
      };
      promise.fail(onFailure);
      promise.done(function(data) {
        return note(data);
      });
      promise.done(function(data) {
        return YD.exam = YD.exam || data;
      });
      promise.done(onSuccess);
      promise.done(function() {
        var shouldRetry;
        shouldRetry = !("currentExam" in YD.exam) && ("upcomingExam" in YD.exam) && _.find(YD.exam.upcomingExam, function(e) {
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
      var data, name, notValid, password, yz;
      e.preventDefault();
      $("input").removeClass("error");
      name = $("#username").val();
      password = $("#password").val();
      yz = $("#yz").val();
      notValid = hasBlank(["#username", "#password", "#yz"]);
      if (notValid) {
        return alertBox("所有输入框都必须填写。");
      } else {
        data = JSON.stringify({
          username: name,
          password: $.md5(password),
          yz: yz
        });
        return postHelper(YD.conf.userLogin, data, function() {
          return redirectToUrl(YD.conf.siteHomeUrl);
        });
      }
    });
  };

  YD.resetPass = function() {
    return $("form").submit(function(e) {
      var data, dontMatch, newPass, newPassConfirm, notValid, oldPass, passwdTooShort;
      e.preventDefault();
      $("input").removeClass("error");
      oldPass = $("#old_pass").val();
      newPass = $("#new_pass").val();
      newPassConfirm = $("#new_pass_confirm").val();
      notValid = hasBlank(["#old_pass", "#new_pass", "#new_pass_confirm"]);
      dontMatch = newPass !== newPassConfirm;
      passwdTooShort = newPass.length < 6;
      if (notValid) {
        return alertBox("所有输入框都必须填写。");
      } else if (passwdTooShort) {
        $("#new_pass").addClass("error");
        $("#new_pass_confirm").addClass("error");
        return alertBox("密码长度至少为6位。");
      } else if (dontMatch) {
        $("#new_pass").addClass("error");
        $("#new_pass_confirm").addClass("error");
        return alertBox("两次输入的新密码不匹配。");
      } else {
        data = JSON.stringify({
          oldPass: $.md5(oldPass),
          newPass: $.md5(newPass),
          newPassConfirm: $.md5(newPassConfirm)
        });
        note(data);
        return postHelper(YD.conf.userResetPass, data, function() {
          return redirectToUrl(YD.conf.userHomeUrl);
        });
      }
    });
  };

}).call(this);
