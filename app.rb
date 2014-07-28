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

get '/supplies' do
  data = ["milk", "butter", "coffee", "bread"]
  JSONP data  # JSONP is an alias for jsonp method
end

get '/supplies' do
  data = ["milk", "butter", "coffee", "bread"]
  JSONP data  # JSONP is an alias for jsonp method
end

# same with symbol param
get '/hallo' do
  data = ["hello","hi","hallo"]
  jsonp data, :functionB
end

get '/user/1/show' do
  user = {
    userName: "王小军",
    gender: "女",
    age: 12,
    dob: "2004-07-26 11:37:53 +0800",
    photo:"http://placehold.it/100x100",
    grade: '小学四年级',
    school: '史家胡同小学',
    email: 'ererer@fltrp.com',
    loginName: 'stu20'
  }
  JSONP user
end
