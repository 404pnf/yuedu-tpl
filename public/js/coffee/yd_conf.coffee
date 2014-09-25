root = global ? window

root.YD ?= {}

YD.conf =
  # 静态路由
  siteHomeUrl: '/'
  tplDir: '/tpl/'
  userLogout: '/log/out '
  userHomeUrl: '/personal_info.html'
  lastExamResult: '/test/personalReport/'
  userTrend: '/charts.html'

  # api的uri
  userInfo: '/userController/show/loginUser'
  grades: '/userController/grades'
  photos: '/userController/photos'
  getExamInfo: '/examController/studentLogin'
  userSave: '/userController/save'
  userLogin: '/userController/login'
