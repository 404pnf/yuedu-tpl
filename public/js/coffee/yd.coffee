# ## 唯一暴露出来的全局变量。也是程序的命名空间
root = global ? window
root.YD ?= {}
YD.debug = true

#
# ## 工具函数
#

# SIDE-EFFECT ONLY
showStatusMsg = (data) ->
  # 错误就是一个字符串，获取方法是读取 data.error 的值
  alert data.error

# 模仿if (predict) {}，
# 或者说模仿scheme中的when。
# **注意：action必须是一个返回函数的函数，这样才能延迟执行**
# 可以用functin  { func } 包裹一下，防止func作为参数时被立即求值
doWhen = (predict, action) ->
  action if predict

# ## 提交表单内容到后台
#
# 1. 从表单获取数据
# 2. 用jquery插件将数据转为json
# 3. 提交json给后台api
# 4. 如果后台返回带"error"的键名的对象，显示错误并停止提交，停留在编辑页面
# 5. 如果后台会返回带有"success"键名的对象，表示提交成功，执行回调函数
postJson = (url, cssID, callback) ->
  formData = data: $(cssID).serializeJSON()
  note formData
  onSuccess = (data) ->
    if data?. error
      showStatusMsg data
    else
      callback()

  onFailure = (data, status, xhr) ->
    showStatusMsg "#{data}, #{status}, #{xhr}"

  $.post url, formData
    .done onSuccess
    .fail onFailure

# 绑定数据到模版并将渲染结果插入到页面
# 1. SIDE-EFFECT ONLY 做参数使用请包裹在 functin  {} 中
# 2. 从局部变量获得数据，绑定模版，插入到html页面中。
# 3. 可以在使用数据前通过callback修饰数据。
# 4. callback中修改的是数据的深拷贝。使用underscore-contrib中的snapshot方法
#    因此不会影响原始数据。
#    这里遵守不是自己创建的数据就不应该修改的原则。
renderLocalData = (data, cssID, tpl, callback) ->
  ->
    cb = callback or _.identity
    clonedData = _.snapshot _.extend(data, YD.conf)
    new EJS(url: YD.conf.tplDir + tpl).update cssID, cb(clonedData)


redirectToUrl = (url) ->
  window.location.replace url


note = (msg) ->
  console.log msg  if YD.debug


hasBlank = (arr) ->
  isBlank = isBlank = (e) ->
    e is ""

  coll = _.map(arr, isBlank)
  _.reduce coll, ((a, e) ->
    a or e
  ), false

#
# ##  user.html 页面
#
YD.user = ->

  userinfo = YD.conf.userInfo
  photos = YD.conf.photos
  grades = YD.conf.grades

  userInfoAndPhoto = $.when($.ajax(userinfo), $.ajax(photos)).then((a, b) ->
    data = (_.extend(a[0], b[0]))
    data
  )
  userInfoAll = $.when($.ajax(userinfo), $.ajax(grades), $.ajax(photos))
    .then((a, b, c) ->
      _.extend(a[0], b[0], c[0])
  )

  userShow = ->
    userInfoAndPhoto.then (data) ->
      new EJS(url: YD.conf.tplDir + "user_show.ejs").update "user_info", data

  userBarShow = ->
    userInfoAndPhoto.then (data) ->
      new EJS(url: YD.conf.tplDir + "user_bar.ejs").update "user_bar", data

  userEdit = ->
    userInfoAll.then (data) ->
      new EJS(url: YD.conf.tplDir + "user_edit.ejs").update "user_info", data

  # 这里不能简化，因为这里不但需要知道总共有多少图片可选还需知道用户当前选的是哪个
  userPhotoEdit = ->
    userInfoAndPhoto.then (data) ->
      new EJS url: "#{YD.conf.tplDir}user_photo_edit.ejs"
        .update "user_info", data

  userSave = ->
    postJson YD.conf.userSave, "form#user_info", ->
      redirectToUrl YD.conf.userHomeUrl

  userPhotoSave = ->
    postJson YD.conf.userSave, "form#user_photo", ->
      redirectToUrl YD.conf.userHomeUrl

  (->

    # 直接显示用户信息和头像
    userShow
    userBarShow

    #
    # 通过jQuery的delegate监听尚未出现在页面的元素
    #

    # 编辑用户
    $("#user_info").delegate "#user_info_edit", "click", userEdit

    # 编辑头像
    $("#user_info").delegate "#user_photo_edit", "click", userPhotoEdit

    # 保存用户
    $("#user_info").delegate "#user_info_save", "click", userSave

    # 保存头像
    $("#user_info").delegate "#user_photo_save", "click", userPhotoSave

    # 监听取消编辑用户信息和取消编辑用户头像信息的按钮；
    $("#user_info").delegate "#user_cancel_edit", "click", ->
      redirectToUrl YD.conf.userHomeUrl

  )()


# 渲染用户条
YD.userBar = userBar = ->

  userinfo = YD.conf.userInfo
  photos = YD.conf.photos

  if YD.userBarShow
    YD.userBarShow
  else

    # 用户条
    userInfoAndPhoto = $.when($.ajax(userinfo), $.ajax(photos)).then((a, b) ->
      d = (_.extend(a[0], b[0])) # 这里如果也用data，会shadow函数onSuccess的输入，虽然不是错误，但避免吧
      d
    )
    userInfoAndPhoto.done (data) ->
      new EJS url: "#{YD.conf.tplDir}user_bar.ejs"
        .update "user_bar", data

#
# ## start.html 生成页面的主函数
#
# 每隔一段时间时间查看一下数据源并重新刷新页面。
YD.startDispache = ->
  next = next = ->
    getExamInfo = $.get(YD.conf.getExamInfo)
    promise = getExamInfo.then((data) ->
      updateDateText = updateDateText = (d) ->
        o = _.map(d.upcomingExam, (e) ->
          if e.isTodayExam
            e.endTime = ""
            e.isTodayExam = "今天"
          else
            e.isTodayExam = ""
          e
        )
        upcomingExam: o


      # 一次性将数据处理好
      if data.upcomingExam
        _.extend data, updateDateText(data), # 直接修改了examInfo
          hasUpcoming: true

        note data
      else
        _.extend data,
          hasUpcoming: false

      data
    )

    note promise

    onSuccess = onSuccess = (data) ->

      # 将判定抽象为函数

      # 将从后台获得的数据（从onSuccess函数的参数传进来）绑定到局部变量
      examInfo = _.snapshot data

      # 将判定抽象为函数

      # 将从后台获得的数据（从onSuccess函数的参数传进来）绑定到局部变量
      examInfo = _.snapshot(data)

      # 有考试，无上次考试成绩 学生状态模版中判定
      ex1up0res0 = _.has(examInfo, "currentExam") and
        examInfo.currentExam.userExamState is "0" and
        not (_.has(examInfo, "latestExamResult"))

      # 有考试，有上次考试成绩， 学生状态在模版中判定
      ex1up0res1 = _.has(examInfo, "currentExam") and
        examInfo.currentExam.userExamState is "0" and
        _.has(examInfo, "latestExamResult")

      # 无考试，有考试预告，无上次考试成绩
      ex0up1res0 = not _.has(examInfo, "currentExam") and
        _.has(examInfo, "upcomingExam") and
        not _.has(examInfo, "latestExamResult")

      # 无考试，有考试预告，有上次考试成绩
      ex0up1res1 = not (_.has(examInfo, "currentExam")) and
        _.has(examInfo, "upcomingExam") and
        _.has(examInfo, "latestExamResult")

      # 无考试，无考试预告，有上次考试成绩
      ex0up0res1 = not (_.has(examInfo, "currentExam")) and
        not _.has(examInfo, "upcomingExam") and
        _.has(examInfo, "latestExamResult")

      # 无考试，无考试预告，无上次成绩
      # 用html的div中默认文字
      ex0up0res0 = not _.has(examInfo, "currentExam") and
        not _.has(examInfo, "upcomingExam") and
        not _.has(examInfo, "latestExamResult")

      render = _.partial renderLocalData, examInfo

      promise.done doWhen ex1up0res0,
        render "front_content", "start_current.ejs"

      promise.done doWhen ex1up0res1,
          render "front_content", "start_scores.ejs"

      promise.done doWhen ex0up1res0,
       render "front_content", "start_upcoming.ejs"

      promise.done doWhen ex0up0res1,
        render "front_content", "start_scores_with_upcoming.ejs"

      promise.done doWhen ex0up1res1,
        render "front_content", "start_scores_with_upcoming.ejs"

    onFailure = ->
      note "链接后台失败。"


    promise.done (data) -> note data

    # set data to cache
    promise.done (data) ->
      YD.exam = YD.exam or data
      note YD.exam

    promise.fail onFailure
    promise.done onSuccess
    promise.done ->

      # 只有在以下情况都满足时候才不断反复请求后台服务器
      # 1. 没有当前考试
      # 2. 有考试预告
      # 3. 考试预告中有今天的考试
      # 这样极大减少了不必要的对后台请求
      shouldRetry = not _.has(YD.exam, "currentExam")and
        _.has(YD.exam, "upcomingExam") and
        _.find YD.exam.upcomingExam, (e) -> e.isTodayExam

      if shouldRetry
        note "满足刷新条件，页面将会刷新。 #{new Date} "
        setTimeout next, 180000 # 3 mins

  # 马上开始第一次调用，实际上浏览器规范中要求最少4ms
  # 用setTimeout调用另一个setTimeout永远不会出现栈溢出
  # 直接 next 调用会栈溢出的。比如10万次递归后。
  # 参见  effective javascript : tip 64，65, page 155
  setTimeout next, 0

#
# ## 登陆页面
#
YD.userLogin = ->
  $("form").submit (e) ->
    e.preventDefault()
    name = $("#username").val()
    password = $("#password").val()
    yz = $("#yz").val()
    if hasBlank([
      name
      password
      yz
    ])
      alert "所有输入框都必须填写。"
    else
      $("#password").val $.md5(password)
      postJson YD.conf.userLogin, "#login", ->
        redirectToUrl YD.conf.siteHomeUrl

YD.resetPass = ->
  $("#reset_pass_save").click (e) ->
    e.preventDefault()
    oldPass = $("#old_pass").val()
    newPass = $("#new_pass").val()
    newPassConfirm = $("#new_pass_confirm").val()

    dontMatch = (newPass isnt newPassConfirm)
    if hasBlank([
      oldPass
      newPass
      newPassConfirm
    ])
      alert "所有输入框都必须填写。"
    else if dontMatch
      alert "两次输入的新密码不匹配。"
    else
      $("#new_pass").val $.md5(newPass)
      $("#old_pass").val $.md5(oldPass)
      $("#new_pass_confirm").val $.md5(newPassConfirm)
      postJson YD.conf.userResetPass, "#reset_pass_form", ->
        redirectToUrl YD.conf.userHomeUrl
