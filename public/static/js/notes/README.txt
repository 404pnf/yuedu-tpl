

## jslint 帮助信息

将下面的注释放到js文件头

- http://jslint.com/
- http://www.jslint.com/lint.html
- http://stackoverflow.com/questions/3039587/jslint-reports-unexpected-dangling-character-in-an-underscore-prefixed-variabl
- jslint警告信息中文版 https://github.com/SFantasy/jslint-error-explanations-zh


## 使用 google closure/traceur compiler

http://closure-compiler.appspot.com/home
https://developers.google.com/closure/compiler/docs/gettingstarted_app

本地运行需要安装 jdk7。 oracle的网站上我没找到下载链接。在某stackoverflow上直接点了个去oracle下载的链接。

下载 google closure compiler

运行

    java -jar compiler.jar --js hello.js --js_output_file hello-compiled.js

本文件夹的Rakefile写了如何自动压缩。

## 如何在js中重定向用户到某url

http://stackoverflow.com/questions/503093/how-can-i-make-a-redirect-page-in-jquery-javascript

    window.location.replace("http://stackoverflow.com");