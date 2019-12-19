/**
 * 加载树形
 * @param menuList
 */
function initNavBarLeft(menuList) {
    if (menuList == null || menuList.length <= 0) {
        return;
    }
    $("#nav-list-id").empty();
    $.each(menuList, function (index, nav) {
        var li = $("<li class>");
        var a;
        if (nav.url == '#') {
            a = $("<a href=\"" + nav.url + "\" class=\"dropdown-toggle\" id=\"navid-" + nav.code + "\">");
        } else {
            a = $("<a href=\"" + nav.url + "\" id=\"navid-" + nav.code + "\">");
        }
        var i = $("<i class=\"menu-icon fa " + nav.imgClass + "\">");
        var span = $("<span class=\"menu-text\">" + nav.showName + "</span>");
        var b = $("<b class=\"arrow fa fa-angle-down\">");
        a.append(i);
        a.append(span);
        if (nav.menuType == 'folder') {
            a.append(b);
        }
        li.append(a);
        var arrow = $("<b class=\"arrow\">");
        li.append(arrow);
        if ($.isArray(nav.nodes) && nav.nodes.length > 0) {
            var ul = $("<ul class=\"submenu\">");
            $.each(nav.nodes, function (i, n) {
                var nli = $("<li>");
                var na = $("<a href=\"" + n.url + "\" id=\"navid-" + n.code + "\">" + n.showName + "</a>");
                var ni = $("<i class=\"menu-icon fa fa-caret-right\">");
                na.append(ni);
                nli.append(na);
                nli.append(arrow);
                ul.append(nli);
            });
            li.append(ul);
        }
        $("#nav-list-id").append(li);
    });
}
function getLibraryUploadPath() {
    return postAjaxWeiXin("library/getUploadUrl",null,false);
}

function getLibraryDownload(libId) {
    return postAjaxWeiXin("library/getDownloadUrl",null,false) + libId;
}
function getLibraryDelete(libId) {
    if(libId == null){
        return postAjaxWeiXin("library/getDeleteUrl",null,false);
    }
    return postAjaxWeiXin("library/getDeleteUrl",null,false) + libId;
}

// “/iot”
function getProjectName() {
    var pathName = window.document.location.pathname;
    return pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
}

//获取路径最后的字段
function getProjectUrl() {
    var pathName = window.document.location.pathname;
    return pathName.substring(pathName.substr(1).indexOf('/') + 2, pathName.length);
}

//“http:”
function getProtocol() {
    return window.location.protocol;
}

/**
 * 根据两个日期，判断相差天数
 * @param sDate1 开始日期 如：2016-11-01
 * @param sDate2 结束日期 如：2016-11-02
 * @returns {number} 返回相差天数
 */
function daysBetween(sDate1, sDate2) {
//Date.parse() 解析一个日期时间字符串，并返回1970/1/1 午夜距离该日期时间的毫秒数
    var time1 = Date.parse(new Date(sDate1));
    var time2 = Date.parse(new Date(sDate2));
    var nDays = Math.abs(parseInt((time2 - time1) / 1000 / 3600 / 24));
    return nDays;
};

/**
 * n为你要传入的参数，当前为0，前一天为-1，后一天为1
 * 返回格式 yyyy-mm-dd
 */
function getBeforeDate(n) {
    var date = new Date();
    var year, month, day;
    date.setDate(date.getDate() + n);
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
    s = year + '/' + (month < 10 ? ('0' + month) : month) + '/' + (day < 10 ? ('0' + day) : day);
    return s;
}

//post提交
function postAjax(url, param, flag) {
    var result = [];
    $.ajax({
        url: url,
        type: 'POST',
        async: false, /* 注意一定不能异步，否则resultData获取不到数据 */
        dataType: 'json',
        data: JSON.stringify(param),
        headers: {
            "Authorization": 'Bearer WEB ' + token,
            "ContentType": "application/json;charset=UTF-8"
        },
        contentType: 'application/json;charset=UTF-8',
        success: function (response) {
            result = response.data;
            if (response.status == 200) {
                if (flag) {
                    popComp.alert("操作成功");
                }
            } else if (response.status == 407 || response.status == 401) { //权限不正确 重新登录
                popComp.alert({message: response.msg}).on(function (e) {
                    loginOut();
                });
            } else {
                popComp.alert({message: response.msg});
            }
        },
        error: function (response) {
            popComp.alert("操作失败，请稍后重试。");
            $(location).attr("href", "login");
        }
    });
    return result;
}

//post提交
function postAjaxWeiXin(url, param, flag) {
    var result = [];
    $.ajax({
        url: url,
        type: 'POST',
        async: false, /* 注意一定不能异步，否则resultData获取不到数据 */
        dataType: 'json',
        data: JSON.stringify(param),
        headers: {
            "Authorization": 'Bearer WeiXin jintai',
            "ContentType": "application/json;charset=UTF-8"
        },
        contentType: 'application/json;charset=UTF-8',
        success: function (response) {
            result = response.data;
            if (response.status == 200) {
                if (flag) {
                    popComp.alert("操作成功");
                }
            } else if (response.status == 407 || response.status == 401) { //权限不正确 重新登录
                popComp.alert({message: response.msg}).on(function (e) {
                    loginOut();
                });
            } else {
                popComp.alert({message: response.msg});
            }
        },
        error: function (response) {
            popComp.alert("操作失败，请稍后重试。");
            $(location).attr("href", "login");
        }
    });
    return result;
}

function addCSS(href) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = href;
    document.getElementsByTagName("head")[0].appendChild(link);
}