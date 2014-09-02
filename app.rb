require 'sinatra'
require 'sinatra/jsonp'

before do
  # 帮助
  # http://stackoverflow.com/questions/20734242/cross-domain-session-with-sinatra-and-angularjs
  headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
  # headers['Access-Control-Allow-Origin'] = 'http://localhost:4567'
  headers['Access-Control-Allow-Origin'] = '*'
  headers['Access-Control-Allow-Headers'] = 'accept, authorization, origin'
  headers['Access-Control-Allow-Credentials'] = 'true'
end

get '/' do
  text = %q(
    <a href=/user.html>user.html</a><br>
    <a href=/start.html>start.html</a><br>
    <a href=/login.html>login.html</a><br>
    <a href=/chart.html>chart.html</a><br>
    <a href=/personal_info.html>personal_info.html</a><br>
    <a href=/front.html>front.html</a><br>
  )
  text
end

get '/userController/photos' do
  photos = {
    photos: [
      { key: 'a', value: '/images/head.png' },
      { key: 'b', value: '/images/head.png' },
      { key: 'c', value: '/images/head.png' },
      { key: 'd', value: '/images/head.png' },
      { key: 'e', value: '/images/head.png' },
      { key: 'f', value: '/images/head.png' },
      { key: 'g', value: '/images/head.png' }
    ]
  }
  JSONP photos
end
get '/userController/grades' do
  grades = {
    grades: [
      { key: 'a', value: '小学一年级' },
      { key: 'b', value: '小学二年级' },
      { key: 'c', value: '小学三年级' },
      { key: 'd', value: '小学四年级' },
      { key: 'e', value: '小学五年级' },
      { key: 'f', value: '小学刘年级' }
    ]
  }
  JSONP grades
end
get '/userController/show/loginUser' do
  user = {
    userName: '田金慧',
    gender: { key: 'male', value: '男' },
    age: 12,
    dob: '2004-07-26 11:37:53 +0800',
    photo: { key: 'e', value: '/images/head.png' },
    grade: { key: 'd', value: '小学四年级' },
    school: '史家胡同小学',
    email: 'ererer@fltrp.com',
    loginName: 'stu20',
    userId: '85b26d10823f7c8c51ef1ffe0d05afd9'
  }
  JSONP user
end

post '/userController/save' do
  # logger.info 'in /user/save '
  status = {
    success: '成功啦',
    error: '错误'
  }
  JSONP status
end

get '/examController/studentLogin' do
  # userExamState:'0|1', //用户考试状态（0：未开始 1：开始 2：结束 3：弃考）
  r = {

    # currentExam: {
    #   endTime: '2014-09-16 15:20',
    #   name: '2014秋季测试',
    #   id: 'exam_id',
    #   userExamState: '0'
    # },

    upcomingExam: [{
        name: '2014秋季测试',
        startTime: '2014-03-26 15:20',
        endTime: '2014-03-26 15:20',
        isTodayExam: true
      },
      {
        name: '2014秋季测试',
        startTime: '2014-04-26 15:20',
        endTime: '2014-04-26 15:20',
        isTodayExam: false
      },
      {
        name: '2014秋季测试',
        startTime: '2014-04-29 15:20',
        endTime: '2014-04-29 15:20',
        isTodayExam: false
      }],

    latestExamResult: {
      examGradeResult: '4级，还不错',
      vocabularySize: '22000',
      personalEndTime: '2014-08-26',
      duration: '15', # 分钟
      id: 'exam_result_id'
    }

  }
  JSONP r
end
