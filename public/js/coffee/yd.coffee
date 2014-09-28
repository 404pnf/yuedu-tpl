# ## 唯一的全局变量
# 也是程序的命名空间
root = global ? window

root.YD ?= {}

YD.debug = false

#
# ## 工具函数
#

# 与后台约定，错误就是一个字符串，获取方法是读取ajax返回对象的error属性。
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

# 简化 if (predict) {}，或者说模仿scheme中的when。
# 注意：action必须是一个返回函数的函数，这样才能延迟执行。
# 可以用 -> 包裹一下，防止action作为参数时被立即求值。
doWhen = (predict, action) ->
  action if predict


# ### 通用的 ajax promise 的回调函数
# 1. 如果后台返回带"error"的键名的对象，显示错误并停止提交，停留在当前页面
# 1. 如果后台会返回带有"success"键名的对象，表示提交成功，执行回调函数


# ### 提交表单内容到后台
#
# 1. 从表单获取数据
# 1. 用jquery插件将数据转为json
# 1. 提交json给后台api
# 1. 调用回调函数
#


# postJson 适用表单数据可以直接提交的情况。
postJson = (url, cssID, callback) ->
  formData = data: $(cssID).serializeJSON()
  note formData

  onSuccess = (data) ->
    if "error" of data
      showStatusMsg data
    else
      callback()
  onFailure = (data, status, xhr) ->
    showStatusMsg "#{data}, #{status}, #{xhr}"

  $.post url, formData
    .done onSuccess
    .fail onFailure

# postHelper 适用表单数据需要处理一下才能提交的情况。
postHelper = (url, data, callback) ->
  note data
  onSuccess = (data) ->
    if "error" of data
      showStatusMsg data
    else
      callback()
  onFailure = (data, status, xhr) ->
    showStatusMsg "#{data}, #{status}, #{xhr}"

  $.post url, data
    .done onSuccess
    .fail onFailure



# ### 绑定数据到模版并将渲染结果插入到页面
# 1. SIDE-EFFECT ONLY 做参数使用请包裹在 functin  {} 中
# 2. 从局部变量获得数据，绑定模版，插入到html页面中。
# 3. 可以在使用数据前通过callback修饰数据。
# 4. callback中修改的是数据的深拷贝。使用underscore-contrib中的snapshot方法
#    因此不会影响原始数据。
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

# ### 检查表单数据是否为空
# 输入：input 框 cssID 的数组。
#
# 输出： true / false
#
# 副作用：所有为空的输入框会被加上 "error" 这个css类
hasBlank = (arrayOfCssElement) ->
  notValid = false

  isBlank = (e) ->
    e is ""

  for e in arrayOfCssElement
    if (isBlank $(e).val())
      $(e).addClass "error"
      notValid = true

  notValid


# ## 用户页面
#
# 1. 后台api的地址在YD.conf中配置
# 2. 一次将用户数据全部拿到。这样在编辑用户信息和编辑用户头像页面的时候，就不用再发请求了
YD.user = ->

  userinfo = YD.conf.userInfo
  photos = YD.conf.photos
  grades = YD.conf.grades

  userInfoAll = $
    .when $.ajax(userinfo), $.ajax(grades), $.ajax(photos)
    .then (a, b, c) ->
      _.extend a[0], b[0], c[0]

  # partial application to save typing
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
    # 直接显示用户信息和头像
    userShow()
    userBarShow()
    #
    # **通过jQuery的delegate监听尚未出现在页面的元素**，因为内容动态从单独模版文件中加载。
    #

    # 编辑用户
    $("#user_info").delegate "#user_info_edit", "click", userEdit

    # 编辑头像
    $("#user_info").delegate "#user_photo_edit", "click", userPhotoEdit

    # 保存用户
    $("#user_info").delegate "#user_info_save", "click", userSave

    # 保存头像
    $("#user_info").delegate "#user_photo_save", "click", userPhotoSave



# ## 渲染用户条
# 后台api的地址在YD.conf中配置
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

#
# ## 用户登录后首页
#
# 1. 根据后台的数据决定显示哪个模版
# 2. 如果无当前考试，且考试预告有今天的考试，定期刷后台，当前考试出现的时候，显示考试入口
YD.startDispache = ->
  # 帮助函数
  # 1. 如果考试预告中有考试是今天的就在模版中显示“今天”两个字
  # 1. 直接修改了examInfo
  updateDateText = (d) ->
    o = _.map d.upcomingExam, (e) ->
      if e.isTodayExam
        e.endTime = ""
        e.isTodayExam = "今天"
      else
        e.isTodayExam = ""

  # 主函数，可能递归调用
  next = ->
    # 一次性将数据处理好
    getExamInfo = $.get YD.conf.getExamInfo
    promise = getExamInfo
      .then (data) ->
        if ("upcomingExam" of data)
          _.extend data, updateDateText(data), hasUpcoming: true
        else
          _.extend data, hasUpcoming: false

    note promise

    # promise 成功时回调
    # 1. 将从后台获得的数据（从onSuccess函数的参数传进来）绑定到局部变量。
    # 1. 将判定抽象为函数。
    # 1. 将所有可能的情况都加入到 promise.done ，doWhen 和判定会选择执行哪个
    onSuccess = (data) ->
      examInfo = _.snapshot data

      hasCurrentExam =  "currentExam" of examInfo
      hasUpcomingExam = "upcomingExam" of examInfo
      haslatestExamResult = "latestExamResult" of examInfo
      userExamState = examInfo.currentExam?.userExamState

      # 有考试，无上次考试成绩 学生状态模版中判定。
      ex1up0res0 = hasCurrentExam and
        not haslatestExamResult

      # 有考试，有上次考试成绩， 学生状态在模版中判定。
      ex1up0res1 = hasCurrentExam and
        haslatestExamResult

      # 无考试，有考试预告，无上次考试成绩。
      ex0up1res0 = not hasCurrentExam and
        hasUpcomingExam and
        not haslatestExamResult

      # 无考试，有考试预告，有上次考试成绩。
      ex0up1res1 = not (hasCurrentExam) and
        hasUpcomingExam and
        haslatestExamResult

      # 无考试，无考试预告，有上次考试成绩。
      ex0up0res1 = not (hasCurrentExam) and
        not hasUpcomingExam and
        haslatestExamResult

      # 无考试，无考试预告，无上次成绩，
      # 用html的div中默认文字。

      # partial function to save typing.
      cssID = "front_content"
      render = _.partial renderLocalData, examInfo, cssID

      promise.done doWhen ex1up0res0, render "start_current.ejs"

      promise.done doWhen ex1up0res1, render "start_scores.ejs"

      promise.done doWhen ex0up1res0, render "start_upcoming.ejs"

      promise.done doWhen ex0up0res1, render "start_scores_with_upcoming.ejs"

      promise.done doWhen ex0up1res1, render "start_scores_with_upcoming.ejs"

    onFailure = (data, status, xhr) ->
      showStatusMsg "#{data}, #{status}, #{xhr}"

    # ### 获得数据后执行的函数
    # 1. 存后台数据到本地
    # 1. 决定是否循环检查后台数据
    promise.fail onFailure

    promise.done (data) ->
      note data

    promise.done (data) ->
      YD.exam = YD.exam or data

    promise.done onSuccess

    # **决定是否循环检查后台数据**
    #
    # 只有在以下情况都满足时候才反复请求后台服务器
    # 1. 没有当前考试
    # 2. 有考试预告
    # 3. 考试预告中有今天的考试
    # 这样极大减少了不必要的对后台请求
    promise.done ->
      shouldRetry = not ("currentExam" of YD.exam) and
        ("upcomingExam" of YD.exam) and
        _.find YD.exam.upcomingExam, (e) -> e.isTodayExam # isTodayExam 的值是 true / false

      if shouldRetry
        note "满足刷新条件，页面将会刷新。 #{new Date()} "
        setTimeout next, 180000 # 3 mins

    return # 明确函数 next 返回值是 undefined。

  # 1. 马上开始第一次调用。实际上浏览器规范中要求最少4ms。
  # 1. 用setTimeout调用另一个setTimeout永远不会出现栈溢出。
  # 1. 直接 next 调用会栈溢出的。比如10万次递归后。
  # 参见  effective javascript : tip 64，65, page 155。
  setTimeout next, 0

#
# ## 登陆页面
#
# 1. 校验不能有input字段唯恐
# 2. 密码用md5求值后再提交给后台
YD.userLogin = ->
  $("form").submit (e) ->
    e.preventDefault()

    # 先移除上一次输入框错误的css类，因为这次人家可能写对了
    $("input").removeClass "error"

    name = $("#username").val()
    password = $("#password").val()
    yz = $("#yz").val()

    notValid = hasBlank([
      "#username"
      "#password"
      "#yz"
    ])

    if notValid
      alertBox "所有输入框都必须填写。"
    else
      data = JSON.stringify {
        username: name
        password: $.md5(password)
        yz: yz
      }
      postHelper YD.conf.userLogin, data, -> redirectToUrl(YD.conf.siteHomeUrl)

#
# ## 重设密码页面
#
# 1. 校验不能有input字段为空
# 2. 校验两次输入新密码是否匹配
# 3. 密码用md5求值后再提交给后台
YD.resetPass = ->
  $("form").submit (e) ->
    e.preventDefault()

    # 先移除上一次输入框错误的css类，因为这次人家可能写对了
    $("input").removeClass "error"

    oldPass = $("#old_pass").val()
    newPass = $("#new_pass").val()
    newPassConfirm = $("#new_pass_confirm").val()

    notValid = hasBlank([
      "#old_pass"
      "#new_pass"
      "#new_pass_confirm"
    ])
    dontMatch = newPass isnt newPassConfirm

    if notValid
      alertBox "所有输入框都必须填写。"
    else if dontMatch
      $("#new_pass").addClass "error"
      $("#new_pass_confirm").addClass "error"
      alertBox "两次输入的新密码不匹配。"
    else
      data = JSON.stringify {
        oldPass: $.md5(oldPass)
        newPass: $.md5(newPass)
        newPassConfirm: $.md5(newPassConfirm)
      }
      postHelper YD.conf.userResetPass, data,  -> redirectToUrl(YD.conf.userHomeUrl)
