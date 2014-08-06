require "sinatra"
require "sinatra/jsonp"

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
  '<a href=/user.html>user.html</a><br><a href=/start.html>start.html</a>'
end

get '/userController/photos' do
  photos = [
      { a: "http://placehold.it/100x100" },
      { b: "http://placehold.it/100x100" },
      { c: "http://placehold.it/100x100" },
      { d: "http://placehold.it/100x100" },
      { e: "http://placehold.it/100x100" },
      { f: "http://placehold.it/100x100" },
      { g: "http://placehold.it/100x100" }
    ]
  JSONP photos
end
get '/userController/grades' do
  grades = [
      { a: "一年级" },
      { b: "二年级" },
      { c: "三年级" },
      { d: "四年级" },
      { e: "五年级" },
      { f: "六年级" },
      { g: "七年级" }
    ]
  JSONP photos
end
get '/userController/show/loginUser' do
  user = {
    userName: "王大军",
    gender: { male: '男' },
    age: 12,
    dob: "2004-07-26 11:37:53 +0800",
    photo: { e: 'http://placehold.it/100x100' },
    grade: { d: '小学四年级' },
    school: '史家胡同小学',
    email: 'ererer@fltrp.com',
    loginName: 'stu20',
    userId: '85b26d10823f7c8c51ef1ffe0d05afd9'
  }
  JSONP user
end

post '/userController/save' do
  #logger.info "in /user/save "
  status = {
    success: '成功啦',
    error: '错误',
  }
  JSONP status
end

get '/examController/show' do
  r = {
        current: {
                    ending_time: '2014-05-26 15:20',
                    name: '2014秋季测试',
                    examId: 'exam_id'
                  },

        upcoming: [
                     {
                        name: '2014秋季测试',
                        starting_time: '2014-03-26 15:20',
                        ending_time: '2014-03-26 15:20',
                        today: true
                      },
                      {
                         name: '2014秋季测试',
                         starting_time: '2014-03-26 15:20',
                         ending_time: '2014-03-26 15:20',
                         today:  false
                      },

                    ],
        scores: {
                  level: '4级，还不错',
                  voc: '22000',
                  last_exam_time: '2014-03-26'
                }

        }
  JSONP r
end

