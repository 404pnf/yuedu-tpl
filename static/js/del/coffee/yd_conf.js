// Generated by CoffeeScript 1.8.0
(function() {
  var root, testing;

  root = typeof global !== "undefined" && global !== null ? global : window;

  if (root.YD == null) {
    root.YD = {};
  }

  testing = true;

  if (testing) {
    YD.conf = {
      siteHomeUrl: '/',
      tplDir: 'js/template/',
      userLogout: '/log/out ',
      userHomeUrl: '/personal_info.html',
      lastExamResult: '/test/personalReport/',
      userTrend: '/charts.html',
      userInfo: '/userController/show/loginUser',
      grades: '/userController/grades',
      photos: '/userController/photos',
      getExamInfo: '/examController/studentLogin',
      userSave: '/userController/save',
      userLogin: '/userController/login',
      userResetPass: '/students/password/reset'
    };
  } else {
    YD.conf = {
      siteHomeUrl: "/student/index",
      tplDir: "/static/js/template/",
      userLogout: "/log/out",
      userHomeUrl: "/student/personal_info",
      lastExamResult: "/test/personalReport/",
      userTrend: "/student/charts",
      userInfo: "/userController/show/loginUser",
      grades: "/userController/grades",
      photos: "/userController/photos",
      getExamInfo: "/examController/studentLogin",
      userSave: "/userController/save",
      userLogin: "/userController/login",
      userResetPass: "/students/password/reset"
    };
  }

}).call(this);