// 初始化登录窗口-j记住我
$(function () {
    if ($.cookie('bit') === '123') {
        $('#remember-me').attr('checked', 'checked');
        $('#input-userId').val($.cookie('userId'));
        $('#input-password').val($.base64.decode($.cookie('password')));
    }
});

$('#btn-signin').on('click', function() {
    const userId = $('#input-userId').val();
    const password = $.base64.encode($('#input-password').val());  //$.base64.decode
    const rememberMe = $('#remember-me').is(':checked');
    $.ajax({
        type: 'POST',
        url: 'auth/token',
        dataType: 'JSON',
        data: {
            userId: userId,
            password: password,
            rememberMe: rememberMe
        },
        success: function(res) {
            console.info(res);
            if (res.status === 200) {
                if ($('#remember-me').is(':checked')) {
                    $.cookie('userId', userId, {
                        expires: cookieValid
                    });
                    $.cookie('password', password, {
                        expires: cookieValid
                    });
                    $.cookie('bit', 123, {
                        expires: cookieValid
                    });
                } else {
                    $.removeCookie('userId');
                    $.removeCookie('password');
                    $.removeCookie('bit');
                }
                $.cookie('token', res.data.token, {
                    expires: cookieValid
                });
                $.cookie('usernameGlobal', userId, {
                    expires: cookieValid
                });
                 $(location).attr("href","index");
            } else {
                popComp.alert('登录失败：' + res.msg != undefined ? res.msg : '未知错误！');
            }
        },
        error: function(res) {
            console.info(res);
            popComp.alert(reg.msg);
        }
    });
    return false;
});