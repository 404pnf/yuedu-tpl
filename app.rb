require 'sinatra'
require 'sinatra/jsonp'
require 'json'

set public_folder: File.dirname(__FILE__) + '/static'
set static_cache_control: [:private, :max_age => 0]
before do

  expires 0, :private, :must_revalidate
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
    <a href=/charts.html>charts.html</a><br>
    <a href=/personal_info.html>user</a><br>
    <a href=/front.html>front.html</a><br>
    <a href=/login.html>login.html</a><br>
    <a href=/pw_edit.html>pw_edit.html</a><br>
  )
  text
end

get '/userController/photos' do
  photos = {
    photos: [
      { key: 'a', value: 'images/head1.png'  },
      { key: 'b', value: 'images/head1.png'  },
      { key: 'c', value: 'images/head1.png'  },
      { key: 'd', value: 'images/head1.png'  },
      { key: 'e', value: 'images/head1.png'  },
      { key: 'f', value: 'images/head1.png'  }
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
    year: 2012, # 数字，不是字符串
    month: 2,
    day: 23,
    dob: '2004-02-26 11:37:53 +0800',
    photo: { key: 'e', value: 'images/head1.png' },
    grade: { key: 'd', value: '小学四年级' },
    school: '史家胡同小学',
    email: 'ererer@fltrp.com',
    loginName: 'stu20',
    userId: '85b26d10823f7c8c51ef1ffe0d05afd9'
  }
  JSONP user
end



get '/examController/studentLogin' do
  # userExamState:'0|1', //用户考试状态（0：未开始 1：开始 2：结束 3：弃考）
  r = {

    # currentExam: {
    #   endTime: '2014-09-16 15:20',
    #   name: '2014秋季测试',
    #   id: 'exam_id',
    #   userExamState: '2'
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

get '/resultsController/loginUser' do
  chart_data = [
    {
      date: '214-08-14',
      value: 19,
      url: '321'
    },
    {
      date: '214-08-15',
      value: 12,
      url: '212'
    },
    {
      date: '214-08-18',
      value: 15,
      url: '4321'
    },
    {
      date: '214-08-18',
      value: 8,
      url: '352'
    },
    {
      date: '214-09-24',
      value: 12,
      url: '73'
    }
  ]

  JSONP chart_data
end

post '/userController/save' do
  # status = { error: '保存用户信息错误' }
  status = { success: '成功啦' }
  JSONP status
end

post '/userController/login' do
  username = params[:username]
  password = params[:password]
  yanzhengma = params[:yz]
  r = { error: '用户名和密码不对。' }
  #r = {success: '成功啦'}
  JSONP r
end

post "/students/password/reset" do
  # r = { error: '用户名和密码不对。' }
  r = {success: '成功啦'}
  JSONP r
end
