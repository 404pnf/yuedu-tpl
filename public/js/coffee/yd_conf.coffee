root = global ? window

root.YD ?= {}

YD.conf =
  # static route
  siteHomeUrl: "/"
  tplDir: "/tpl/"
  userLogout: "/log/out "
  userHomeUrl: "/personal_info.html"
  lastExamResult: "/test/personalReport/"
  userTrend: "/charts.html"

  # api part
  userInfo: "/userController/show/loginUser"
  grades: "/userController/grades"
  photos: "/userController/photos"
  getExamInfo: "/examController/studentLogin"
  userSave: "/userController/save"
  userLogin: "/userController/login"
