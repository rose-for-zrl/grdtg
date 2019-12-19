var token;
var usernameGlobal;
var cookieValid = 7; //cookie 将被保存 7 天
$(function () {

    if ($.cookie('token') != null && token == null) {
        token = $.cookie('token');
    }
    if ($.cookie('usernameGlobal') != null && usernameGlobal == null) {
        usernameGlobal = $.cookie('usernameGlobal');
    }
    $("#usernameGlobal").text(usernameGlobal);
    //获取用户菜单栏
    var currentUrl = getProjectUrl();
    if (currentUrl != "" && currentUrl != "login") {
        var menuList = postAjax("api/sys/menu/getMenu", null,false);
        initNavBarLeft(menuList);
        //加载左侧导航
        $("#nav-list-id li a").each(function () {
            var selected = this;
            var attrHref = $(this).attr("href");
            if (attrHref == currentUrl) {
                var selectedId = $(this).attr("id");
                $(this).parent().addClass('active');
                var parentId = $(this).parent().parent().attr("id");
                if (parentId != 'nav-list-id') {
                    var parentId = $(this).parent().parent().parent().addClass("open");
                    var parentId = $(this).parent().parent().parent().addClass("active");
                }
            }
        })
    }
});

function loginOut() {
    $(location).attr("href", "login");
    var data = postAjax("auth/loginOut/" + usernameGlobal, null,false); //查询该设备的最新一条数据
    usernameGlobal = null;
    $.removeCookie('token');
    $.removeCookie('usernameGlobal');
}