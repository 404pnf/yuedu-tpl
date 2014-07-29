
    $("#login").click(function () {
        login_test();
    })

    //监听enter键
    $(document).keyup(function (e) {
        if (e.which == 13)
            login_test();
    })

    // //重新请求验证码
    // $("#change_code").click(function () {
    //     $("#image_code").attr("src", "/login/code?" + new Date().getMilliseconds());
    // })

    //验证账号格式,都不能为空
    function login_test() {
        // var user = $("#user_login_name").val();
        // var pass = $("#password").val();
        // var code = $("#user_code").val();
        // if (user == "" || pass == "" || code == "") {
        //     $("#login_warning").css("visibility", "visible");
        //     $("#warning_info").html("请输入账号、密码、验证码");
        //     return;
        // }
        // $("#password").val($.md5(pass));
        $("#form_login").submit();
    }
    //忘记密码
    // $("#pass_forget").hover(function () {
    //             $.ajax({
    //                 type: 'get',
    //                 contentType: 'charset:UTF-8',
    //                 url: '/login/pass?or=fltrp&r='+$("#user_type").val(),
    //                 success: function (data) {
    //                     $(".forget_tip").css("display", "block");
    //                     $("#admin_info").html(data);
    //                     setTimeout('$(".forget_tip").css("display", "none")',3000)
    //                 }
    //             })
    //         },
    //         function () {
    //             $(".forget_tip").css("display", "none");
    //         }
    // )
