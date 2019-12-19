jQuery(function ($) {
    //提示信息
    var lang = {
        "sProcessing": "正在加载中...",
        "sLengthMenu": "每页 _MENU_ 项",
        "sZeroRecords": "没有匹配结果",
        "sInfo": "当前显示第 _START_ 至 _END_ 项，共 _TOTAL_ 项。",
        "sInfoEmpty": "当前显示第 0 至 0 项，共 0 项",
        "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
        "sInfoPostFix": "",
        "sSearch": "搜索:",
        "sUrl": "",
        "sEmptyTable": "查询无数据",
        "sLoadingRecords": "查询中...",
        "sInfoThousands": ",",
        "oPaginate": {
            "sFirst": "首页",
            "sPrevious": "上页",
            "sNext": "下页",
            "sLast": "末页",
            "sJump": "跳转"
        }
    };
    var jqOption = {
        stripeClasses: ["odd", "even"],  //为奇偶行加上样式，兼容不支持CSS伪类的场合
        language: lang,  //提示信息
        autoWidth: false,  //禁用自动调整列宽
        serverSide: true,  //启用服务器端分页
        searching: false,  //禁用原生搜索
        processing: true,  //隐藏加载提示,自行处理
        bLengthChange: false, //隐藏每页显示多少条数据方法
        sort: false,
        orderMulti: false,  //启用多列排序
        order: [],  //取消默认排序查询,否则复选框一列会出现小箭头
        renderer: "bootstrap",  //渲染样式：Bootstrap和jquery-ui
        paginationType: "bootstrap",//翻页风格
        pagingType: "simple_numbers",  //分页样式：simple,simple_numbers,full,full_numbers
        filter: true, //是否启动过滤、搜索功能
        columns: [
            {"data": "tableKey", title: "tableKey"},
            {"data": "parentKey", title: "父级ID"},
            {"data": "showName", title: "菜单名称"},
            {"data": "sort", title: "排序"},
            {"data": "code", title: "菜单ID"},
            {"data": "menuType", title: "菜单类型"},
            {"data": "imgClass", title: "菜单图标"},//文件夹需要设定
            {"data": "createTime", title: "创建时间"},
            {"data": "status", title: "状态"},
            {"data": null, title: "操作"}
        ],
        columnDefs: [
            {
                "targets": 0, //第一列隐藏
                "data": "tableKey",
                "visible": false,//不可见
                "searchable": false
            },
            {
                "targets": 1,
                "data": "parentKey",
                "visible": false,//不可见
                "searchable": false
            },
            {
                "targets": 5,
                "mRender": function (data, type, full) { //folder  item
                    return data == 'item' ? "元素" : "目录";
                }
            },
            {
                "targets": 8,
                "mRender": function (data, type, full) {
                    return data == 1 ? "有效" : "无效";
                }
            },
            {
                "targets": 9,
                "data": null,
                "render": function (data, type, row) {
                    var tableKey = row.tableKey;
                    var html = "<div class='hidden-sm hidden-xs action-buttons'>";
                    html += "<a href='javascript:void(0);' onclick='updateMenu(\"" + tableKey + "\")' class='green'><i class='ace-icon fa fa-pencil bigger-130'></i></a>"
                    html += "</div>";
                    return html;
                }
            }
        ],
        ajax: function (data, callback, settings) {
            //封装请求参数
            var param = {};
            param.pageSize = data.length;//页面显示记录条数，在页面显示每页显示多少项的时候
            param.pageNo = (data.start / data.length) + 1;//当前页码  todo
            var serializeArray = $("#search-form").serializeArray();
            $.each(serializeArray, function () {
                param[this.name] = this.value;
            })
            var result = postAjax("api/sys/menu/query", param, false);
            setTimeout(function () {
                //封装返回数据
                var returnData = {};
                returnData.draw = data.current;//这里直接自行返回了draw计数器,应该由后台返回
                returnData.recordsTotal = result.total;//返回数据全部记录
                returnData.recordsFiltered = result.total;//后台不实现过滤功能，每次查询均视作全部结果
                returnData.data = result.records;//返回的数据列表
                //调用DataTables提供的callback方法，代表数据已封装完成并传回DataTables进行渲染
                //此时的数据需确保正确无误，异常判断应在执行此回调前自行处理完毕
                callback(returnData);
            }, 200);
        }
    };
    initMenu();
    //初始化表格
    var myTable = $("#dynamic-table").DataTable(jqOption);//此处需调用api()方法,否则返回的是JQuery对象而不是DataTables的API对象
    $('#menu-search').on("click", function () {
        myTable.draw();//搜索方法  让datatables执行一次提交ajax
    });

    $('.chosen-select').chosen({
        search_contains: true, //关键字模糊搜索。设置为true，只要选项包含搜索词就会显示；设置为false，则要求从选项开头开始匹配
        allow_single_deselect: true, //单选下拉框是否允许取消选择。如果允许，选中选项会有一个x号可以删除选项
        disable_search: false, //禁用搜索。设置为true，则无法搜索选项。
        disable_search_threshold: 3, //当选项少等于于指定个数时禁用搜索。
        inherit_select_classes: true, //是否继承原下拉框的样式类，此处设为继承
        placeholder_text_single: '选择角色', //单选选择框的默认提示信息，当选项为空时会显示。如果原下拉框设置了data-placeholder，会覆盖这里的值。
        width: '45%', //设置chosen下拉框的宽度。即使原下拉框本身设置了宽度，也会被width覆盖。
        max_shown_results: 1000, //下拉框最大显示选项数量
        display_disabled_options: false,
        single_backstroke_delete: true, //false表示按两次删除键才能删除选项，true表示按一次删除键即可删除
        case_sensitive_search: false, //搜索大小写敏感。此处设为不敏感
        group_search: false, //选项组是否可搜。此处搜索不可搜
        include_group_label_in_selected: true //选中选项是否显示选项分组。false不显示，true显示。默认false。
    });

    $("#add-btn").on("click", function () {
        var data = {};
        var serializeArray = $("#menu-form").serializeArray();
        $.each(serializeArray, function () {
            data[this.name] = this.value;
        });
        postAjax("api/sys/menu/createOrUpdate", data, true);//JSON.stringify(data) json 转换为字符串
        $('#modal-table').modal('toggle');
        myTable.draw();
    });

    $("#menu-add").on("click", function () {
        loadResult({});
    });
});

function initMenu() {
    var menuList = postAjax('api/sys/menu/getAllMenu', null, false);
    if ($.isArray(menuList) && menuList.length > 0) {
        recursiveRenderMenuSelect(menuList, 1);
    }
}

//渲染部门树下拉
function recursiveRenderMenuSelect(menuList, level) {
    level = level | 0;
    if (menuList && menuList.length > 0) {
        $(menuList).each(function (i, menu) {
            var blank = "";
            if (level > 1) {
                for (var j = 3; j <= level; j++) {
                    blank += "&nbsp;&nbsp;&nbsp;&nbsp;";
                }
                blank += "&nbsp;&nbsp;&nbsp;&nbsp;";
            }
            var optionStr = "<option value='" + menu.id + "'> " + blank + menu.showName + "</option>";
            $('#add-parentKey').append(optionStr);
            if (menu.nodes && menu.nodes.length > 0) {
                recursiveRenderMenuSelect(menu.nodes, level + 1);
            }
        });
    }
}

function updateMenu(tableKey) {
    $('#modal-table').modal('toggle');
    var result = postAjax("api/sys/menu/query/" + tableKey, null, false);
    console.info(result);
   loadResult(result);
}

function loadResult(result) {
    if(result == null){
        popComp.alert("无此菜单信息，请刷新页面");
        return;
    }
    $("#add-tableKey").val(result.tableKey);
    $("#add-showName").val(result.showName);
    $("#add-url").val(result.url);
    $("#add-parentKey").val(result.parentKey);
    $("#add-sort").val(result.sort);
    $("#add-code").val(result.code);
    $("#add-menuType").val(result.menuType);
    $("#add-imgClass").val(result.imgClass);
    $("#add-status").val(result.status);
}