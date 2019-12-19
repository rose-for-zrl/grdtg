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
        sort: false,
        orderMulti: false,  //启用多列排序
        order: [],  //取消默认排序查询,否则复选框一列会出现小箭头
        renderer: "bootstrap",  //渲染样式：Bootstrap和jquery-ui
        paginationType: "bootstrap",//翻页风格
        pagingType: "simple_numbers",  //分页样式：simple,simple_numbers,full,full_numbers
        filter: true, //是否启动过滤、搜索功能
        columns: [
            {"data": "userId", title: "用户ID"},
            {"data": "userName", title: "姓名"},
            {"data": "phoneNumber", title: "电话号码"},
            {"data": "deptName", title: "组织机构"},
            {"data": "idCard", title: "身份证号码"},
            {"data": "state", title: "状态"},
            {"data": null, title: "操作"}
        ],
        columnDefs: [
            {
                "targets": 5,
                "mRender": function (data, type, full) {
                    return data == 1 ? "正常" : data == 0 ? "禁用" : "离职";
                }
            },
            {
                "targets": 6,
                "data": null,
                "render": function (data, type, row) {
                    var userId = row.userId;
                    var html = "<div class='hidden-sm hidden-xs action-buttons'>";
                    html += "<a href='javascript:void(0);' onclick='queryUser(\"" + userId + "\")' class='blue'><i class='ace-icon fa fa-search-plus bigger-130'></i></a>"
                    html += "<a href='javascript:void(0);' onclick='updateUser(\"" + userId + "\")' class='green'><i class='ace-icon fa fa-pencil bigger-130'></i></a>"
                    html += "<a href='javascript:void(0);' onclick='resetPassword(\"" + userId + "\")' class='green'><i class='ace-icon fa fa-key bigger-130'></i></a>"
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
            var result = postAjax("api/sys/users/query", param, false);
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
    initDept();
    initRole();
    //初始化表格
    var myTable = $("#dynamic-table").DataTable(jqOption);//此处需调用api()方法,否则返回的是JQuery对象而不是DataTables的API对象
    $('#user-search').on("click", function () {
        myTable.draw();//搜索方法  让datatables执行一次提交ajax
    });

    $("#user-add").on("click", function () {
        $("#add-password").parent().parent().show();//密码显示
        $("#add-password").removeAttr("hidden");
        $("#add-btn").show(); //提交按钮显示
        loadResult({});
    });

    formValidator();
    //Modal验证销毁重构
    $('#modal-table').on('hidden.bs.modal', function () {
        $("#user-form").data('bootstrapValidator').destroy();
        $('#user-form').data('bootstrapValidator', null);
        formValidator();
    });
    $("#add-btn").click(function () {
        $('#user-form').data('bootstrapValidator').validate();
        if (!$("#user-form").data("bootstrapValidator").isValid()) {
            return;
        }
        var data = {};
        var serializeArray = $("#user-form").serializeArray();
        $.each(serializeArray, function () {
            data[this.name] = this.value;
        });
        data["roleIds"] = $("#add-roleIds").val();
        var result = postAjax("api/sys/users/createOrUpdate", data,false );
        if (result) {
            popComp.alert("操作成功").on(function (e) {
                if (!e) {
                    return;
                }
                $('#modal-table').modal('toggle');
                myTable.draw();
            });
        }
    });
});

function formValidator() {
    $("#user-form").bootstrapValidator({
       // excluded: [":hidden"],
        message: '表单基本校验',
        submitButtons: '#add-btn',
        feedbackIcons: {
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            userName: {
                message: '姓名校验',
                validators: {
                    notEmpty: {
                        message: '姓名不能为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 20,
                        message: '姓名在2-20个字之间'
                    },
                    regexp: {
                        regexp: /^([\u4e00-\u9fa5]{1,20}|[a-zA-Z\.\s]{1,20})$/,
                        message: '姓名由字母或者汉字组成'
                    }
                }
            },
            phoneNumber: {
                message: '手机号校验',
                validators: {
                    notEmpty: {
                        message: '手机号不能为空'
                    },
                    phoneNumberCheck: {
                        message: '手机号码有误，请重新输入'
                    }
                }
            },
            idCard: {
                message: '身份证号码校验',
                validators: {
                    notEmpty: {
                        message: '身份证号码不能为空'
                    },
                    idCardCheck: {
                        message: '身份证号码有误，请重新输入'
                    }
                }
            },
            passwd: {
                message: '密码校验',
                validators: {
                    stringLength: {
                        min: 8,
                        max: 16,
                        message: '密码在8-16个字符之间'
                    },
                    passwordCheck: {
                        message: '密码必须包含一个大写字母、一个小写字母、一个数字、一个特殊符号'
                    }
                }
            },
            deptId: {
                message: '所属部门校验',
                validators: {
                    notEmpty: {
                        message: '所属部门不能为空'
                    }
                }
            },
            roleIds: {
                message: '角色校验',
                validators: {
                    notEmpty: {
                        message: '角色不能为空'
                    }
                }
            }
        }
    });
}

//初始化组织架构
function initDept() {
    var deptList = postAjax('api/sys/dept/tree', null, false);
    if ($.isArray(deptList) && deptList.length > 0) {
        recursiveRenderDeptSelect(deptList, 1);
    }
}

//渲染部门树下拉
function recursiveRenderDeptSelect(deptList, level) {
    level = level | 0;
    if (deptList && deptList.length > 0) {
        $(deptList).each(function (i, dept) {
            var blank = "";
            if (level > 1) {
                for (var j = 3; j <= level; j++) {
                    blank += "&nbsp;&nbsp;&nbsp;&nbsp;";
                }
                blank += "&nbsp;&nbsp;&nbsp;&nbsp;";
            }
            var optionStr = "<option value='" + dept.id + "'> " + blank + dept.text + "</option>";
            $('#form-deptId').append(optionStr);
            $('#add-deptId').append(optionStr);
            if (dept.nodes && dept.nodes.length > 0) {
                recursiveRenderDeptSelect(dept.nodes, level + 1);
            }
        });
    }
}

function initRole() {
    //查询所有角色资源
    var roles = postAjax("api/sys/role/query/", {"pageNo": 1, "pageSize": 100}, false);
    if (roles != null) {
        $("#add-roleIds").empty();
        $.each(roles.records, function (n, role) {
            $("#add-roleIds").append(" <option value=" + role.tableKey + ">" + role.roleName + "</option>");
        });
    }
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
}

function queryUser(userId) {
    $('#modal-table').modal('toggle');
    var result = postAjax("api/sys/users/query/" + userId, null, false);
    loadResult(result);
    $("#add-password").parent().parent().hide();//密码隐藏
    $("#add-btn").hide(); //提交按钮隐藏
}

function updateUser(userId) {
    $('#modal-table').modal('toggle');
    var result = postAjax("api/sys/users/query/" + userId, null, false);
    loadResult(result);
    $("#add-password").parent().parent().hide();//密码隐藏
    $("#add-password").attr("hidden","hidden");
    $("#add-btn").show(); //提交按钮显示
}


function loadResult(result) {
    if (result == null) {
        popComp.alert("无此用户信息，请重新查询");
        return;
    }
    $("#add-userId").val(result.userId);
    $("#add-state").val(result.state);
    $("#add-userName").val(result.userName);
    $("#add-idCard").val(result.idCard);
    $("#add-phoneNumber").val(result.phoneNumber);
    $("#add-entryTime").val(result.entryTime);
    $("#add-deptId").val(result.deptId);
    var roleValue = [];
    if (result.roles != null) {
        $.each(result.roles, function (n, role) {
            roleValue[n] = role.resourceKey;
        });
    }
    $("#add-roleIds").val(roleValue).trigger("chosen:updated");
}

function resetPassword(userId) {
    popComp.confirm({
        title: "重置密码",
        message: "是否确认重置用户【" + userId + "】的密码?",
    }).on(function (e) {
        if (!e) {
            return;
        }
        postAjax("api/sys/users/resetPassword/" + userId, {}, true);
    });
}