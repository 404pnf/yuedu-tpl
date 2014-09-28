## 唯一的全局变量
也是程序的命名空间

    root = global ? window
    root.YD ?= {}
    YD.debug = false


## 工具函数
与后台约定，错误就是一个字符串，获取方法是读取ajax返回对象的error属性。

    showStatusMsg = (data) ->
      alertBox data.error
      return

    alertBox = (msg) ->
      $("#msg").text msg
      $("#msg").dialog
        modal: true
        buttons:
          Ok: -> # do NOT use fat arror!! or the dialog won't close
            $(this).dialog "close"
      return

简化 if (predict) {}，或者说模仿scheme中的when。注意：action必须是一个返回函数的函数，这样才能延迟执行。
可以用 -> 包裹一下，防止action作为参数时被立即求值。

    doWhen = (predict, action) ->
      action if predict


## 通用的ajax请求后成功和失败的回调函数

    onSuccess = (data) ->
      if "error" of data
        showStatusMsg data
      else
        callback()

    onFailure = (data, status, xhr) ->
      showStatusMsg "#{data}, #{status}, #{xhr}"

## 提交表单内容到后台

a. 从表单获取数据
b. 用jquery插件将数据转为json
c. 提交json给后台api
d. 如果后台返回带"error"的键名的对象，显示错误并停止提交，停留在编辑页面
e. 如果后台会返回带有"success"键名的对象，表示提交成功，执行回调函数


    postJson = (url, cssID, callback) ->
      formData = data: $(cssID).serializeJSON()

      note formData

      $.post url, formData
        .done onSuccess
        .fail onFailure
      return

## 绑定数据到模版并将渲染结果插入到页面
a. 做参数使用请包裹在 functin  {} 中
b. 从局部变量获得数据，绑定模版，插入到html页面中。
c. 可以在使用数据前通过callback修饰数据。
d. callback中修改的是数据的深拷贝。使用underscore-contrib中的snapshot方法
   因此不会影响原始数据。

    renderLocalData = (data, cssID, tpl, callback) ->
      ->
        cb = callback or _.identity
        clonedData = _.snapshot (_.extend data, YD.conf)
        new EJS url: "#{YD.conf.tplDir}#{tpl}"
          .update cssID, cb(clonedData)
        return

    redirectToUrl = (url) ->
      window.location.replace url
      return

    note = (msg) ->
      console.log msg  if YD.debug

    hasBlank = (arr) ->
      isBlank = (e) ->
        e is ""

      coll = _.map(arr, isBlank)

      _.reduce coll,
        (a, e) -> a or e,
        false


## 用户页面
a. 后台api的地址再YD.conf中配置
b. 一次将用户数据全部拿到。这样在编辑用户信息和编辑用户头像页面的时候，就不用再发请求了

    YD.user = ->

      userinfo = YD.conf.userInfo
      photos = YD.conf.photos
      grades = YD.conf.grades


      userInfoAll = $
        .when $.ajax(userinfo), $.ajax(grades), $.ajax(photos)
        .then (a, b, c) ->
          _.extend a[0], b[0], c[0]

partial application to save typing

      userRender = (tpl, cssID, data) ->
        new EJS(url: YD.conf.tplDir + tpl).update cssID, data

      userShow = ->
        userInfoAll.done (data) ->
          userRender "user_show.ejs", "user_info", data

      userBarShow = ->
        userInfoAll.done (data) ->
          userRender "user_bar.ejs", "user_bar", data

      userEdit = ->
        userInfoAll.done (data) ->
          userRender "user_edit.ejs", "user_info", data

      userPhotoEdit = ->
        userInfoAll.done (data) ->
          userRender "user_photo_edit.ejs", "user_info", data

      userSave = ->
        postJson YD.conf.userSave, "form#user_info", ->
          redirectToUrl YD.conf.userHomeUrl

      userPhotoSave = ->
        postJson YD.conf.userSave, "form#user_photo", ->
          redirectToUrl YD.conf.userHomeUrl

      do ->

直接显示用户信息和头像

        userShow()
        userBarShow()

## 通过jQuery的delegate监听尚未出现在页面的元素**，因为内容动态从单独模版文件中加载。

编辑用户

        $("#user_info").delegate "#user_info_edit", "click", userEdit

编辑头像

        $("#user_info").delegate "#user_photo_edit", "click", userPhotoEdit

保存用户

        $("#user_info").delegate "#user_info_save", "click", userSave

保存头像

        $("#user_info").delegate "#user_photo_save", "click", userPhotoSave



## 渲染用户条
后台api的地址再YD.conf中配置

    YD.userBar = ->
      userinfo = YD.conf.userInfo
      photos = YD.conf.photos

      userInfoAndPhoto = $
        .when $.ajax(userinfo), $.ajax(photos)
        .then (a, b) ->
          _.extend a[0], b[0]

      userInfoAndPhoto.done (data) ->
        new EJS url: "#{YD.conf.tplDir}user_bar.ejs"
          .update "user_bar", data
      return


## 用户登录后首页

a. 根据后台的数据决定显示哪个模版
b. 如果无当前考试，且考试预告有今天的考试，定期刷后台，当有当前考试的时候，显示考试

    YD.startDispache = ->

帮助函数
a. 如果考试预告中有考试是今天的就在模版中显示今天两个字
b. 直接修改了examInfo

      updateDateText = (d) ->
        o = _.map d.upcomingExam, (e) ->
          if e.isTodayExam
            e.endTime = ""
            e.isTodayExam = "今天"
          else
            e.isTodayExam = ""

主函数，可能递归调用

      next = ->
        getExamInfo = $.get YD.conf.getExamInfo

一次性将数据处理好

        promise = getExamInfo
          .then (data) ->
            if ("upcomingExam" of data)
              _.extend data, updateDateText(data), hasUpcoming: true
            else
              _.extend data, hasUpcoming: false


        note promise

ajax成功获得数据后的回调
a. 将从后台获得的数据（从onSuccess函数的参数传进来）绑定到局部变量。
b. 将判定抽象为函数。
c. 将所有可能的情况都加入到promise.done doWhen和判定会选择执行哪个

        onSuccess = (data) ->
          examInfo = _.snapshot data

          hasCurrentExam =  "currentExam" of examInfo
          hasUpcomingExam = "upcomingExam" of examInfo
          haslatestExamResult = "latestExamResult" of examInfo
          userExamState = examInfo.currentExam?.userExamState

有考试，无上次考试成绩 学生状态模版中判定。

          ex1up0res0 = hasCurrentExam and
            not haslatestExamResult

有考试，有上次考试成绩， 学生状态在模版中判定。

          ex1up0res1 = hasCurrentExam and
            haslatestExamResult

无考试，有考试预告，无上次考试成绩。

          ex0up1res0 = not hasCurrentExam and
            hasUpcomingExam and
            not haslatestExamResult

无考试，有考试预告，有上次考试成绩。

          ex0up1res1 = not (hasCurrentExam) and
            hasUpcomingExam and
            haslatestExamResult

无考试，无考试预告，有上次考试成绩。

          ex0up0res1 = not (hasCurrentExam) and
            not hasUpcomingExam and
            haslatestExamResult

无考试，无考试预告，无上次成绩，用html的div中默认文字。

partial function to save typing.

          cssID = "front_content"
          render = _.partial renderLocalData, examInfo, cssID

将渲染页面函数依次加入promise.done

          promise.done doWhen ex1up0res0, render "start_current.ejs"

          promise.done doWhen ex1up0res1, render "start_scores.ejs"

          promise.done doWhen ex0up1res0, render "start_upcoming.ejs"

          promise.done doWhen ex0up0res1, render "start_scores_with_upcoming.ejs"

          promise.done doWhen ex0up1res1, render "start_scores_with_upcoming.ejs"

请求失败的回调

        onFailure = (data, status, xhr) ->
          showStatusMsg "#{data}, #{status}, #{xhr}"

## 获得数据后执行的函数
a. 存后台数据到本地
b. 决定是否循环检查后台数据

        promise.fail onFailure

        promise.done (data) ->
          note data # for debugging

        promise.done (data) ->
          YD.exam = YD.exam or data

        promise.done onSuccess

## 决定是否循环检查后台数据
只有在以下情况都满足时候才反复请求后台服务器

a. 没有当前考试
b. 有考试预告
c. 考试预告中有今天的考试

这样极大减少了不必要的对后台请求

        promise.done ->
          shouldRetry = not ("currentExam" of YD.exam) and
            ("upcomingExam" of YD.exam) and
            _.find YD.exam.upcomingExam, (e) -> e.isTodayExam # isTodayExam 的值是 true / false

          if shouldRetry
            note "满足刷新条件，页面将会刷新。 #{new Date()} "
            setTimeout next, 180000 # 3 mins

        return # 明确函数 next 返回值是 undefined。

马上开始第一次调用。实际上浏览器规范中要求最少4ms。
用setTimeout调用另一个setTimeout永远不会出现栈溢出。
直接 next 调用会栈溢出的。比如10万次递归后。参见  effective javascript : tip 64，65, page 155。

      setTimeout next, 0


## 登陆页面

a. 校验不能有input字段唯恐
b. 密码用md5求值后再提交给后台


    YD.userLogin = ->
      $("form").submit (e) ->
        e.preventDefault()

        name = $("#username").val()
        password = $("#password").val()
        yz = $("#yz").val()

        notValid = hasBlank([
          name
          password
          yz
        ])

        if notValid
          alertBox "所有输入框都必须填写。"
        else
          data = JSON.stringify {
            username: name
            password: $.md5(password)
            yz: yz
          }
          $.post YD.conf.userLogin, data
            .done onSuccess
            .fail onFailure


## 重设密码页面

a. 校验不能有input字段为空
b. 校验两次输入新密码是否匹配
c. 密码用md5求值后再提交给后台

    YD.resetPass = ->
      $("form").submit (e) ->
        e.preventDefault()

        oldPass = $("#old_pass").val()
        newPass = $("#new_pass").val()
        newPassConfirm = $("#new_pass_confirm").val()

        notValid = hasBlank([
          oldPass
          newPass
          newPassConfirm
        ])
        dontMatch = newPass isnt newPassConfirm

        if notValid
          alertBox "所有输入框都必须填写。"
        else if dontMatch
          alertBox "两次输入的新密码不匹配。"
        else
          data = JSON.stringify {
            oldPass: $.md5(oldPass)
            newPass: $.md5(newPass)
            newPassConfirm: $.md5(newPassConfirm)
          }
          $.post YD.conf.userResetPass, data
            .done onSuccess
            .fail onFailure
