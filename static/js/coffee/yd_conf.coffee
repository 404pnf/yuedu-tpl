root = global ? window

root.YD ?= {}

# ## 本地配置
YD.conf =
  # 静态路由
  siteHomeUrl: '/'
  tplDir: 'js/template/'
  userLogout: '/log/out '
  userHomeUrl: '/personal_info.html'
  lastExamResult: '/test/personalReport/'
  userTrend: '/charts.html'

  # api的路由
  userInfo: '/userController/show/loginUser'
  grades: '/userController/grades'
  photos: '/userController/photos'
  getExamInfo: '/examController/studentLogin'
  userSave: '/userController/save'
  userLogin: '/userController/login'
  userResetPass: '/students/password/reset'

# ## 线上配置
# YD.conf =
#   # static route
#   siteHomeUrl:"/student/index",
#   tplDir: "js/template//",
#   userLogout: "/log/out",
#   userHomeUrl: "/student/personal_info",
#   lastExamResult: "/test/personalReport/",
#   userTrend: "/student/charts",

#   # api part
#   userInfo: "/userController/show/loginUser",
#   grades: "/userController/grades",
#   photos: "/userController/photos",
#   getExamInfo: "/examController/studentLogin",
#   userSave: "/userController/save",
#   userLogin: "/userController/login",
#   userResetPass:"/students/password/reset"

