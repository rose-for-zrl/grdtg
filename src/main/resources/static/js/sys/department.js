var deptList;//记录树
jQuery(function ($) {
    loadDept(0);
    $('#id-button-borders').attr('checked', 'checked').on('click', function () {
        $('#default-buttons .btn').toggleClass('no-border');
        var disabled = $('#default-buttons .btn').attr("disabled") == null ? false : true;
        $('#default-buttons .btn').attr("disabled", !disabled);
    });
    bindDeptClick();//添加各种监听事件
});

//组装部门树
function loadDept(selectNode) {
    deptList = postAjax('api/sys/dept/tree', null,false);
    if ($.isArray(deptList) && deptList.length > 0) {
        var setting = {
            color: "#428bca",
            showBorder: false,
            data: deptList,
            levels: 3
        };
        recursiveRenderDeptSelect(deptList, 1);

        $('#tree').treeview(setting);
        $("#tree").treeview('selectNode', [selectNode, {silent: true}]);//默认选中
    }
}

//递归组装部门树
function combinationDept(deptList) {
    if (deptList && deptList.length > 0) {
        $(deptList).each(function (i, dept) {
            //设置树需要的标签 todo
            if (dept.nodes && dept.nodes.length > 0) {
                combinationDept(dept.nodes);
            }
        });
    }
    return deptList;
}

//点击监听中回调方法
function clickTree(node) {
    $("#form-tableKey").val(node.id);
    $("#form-deptName").val(node.text);
    $("#form-parentKey").val(node.pid);
    $("#form-sort").val(node.sort);
    $("#form-remark").val(node.remark);
    $("#form-state").val(node.status);
}

//渲染部门树下拉
function recursiveRenderDeptSelect(deptList, level) {
    level = level | 0;
    if (deptList && deptList.length > 0) {
        $(deptList).each(function (i, dept) {
            var blank = "";
            if (level > 1) {
                for (var j = 3; j <= level; j++) {
                    blank += "..";
                }
                blank += "∟";
            }
            var optionStr = "<option value='" + dept.id + "'> " + blank + dept.text + "</option>";
            $('#form-parentKey').append(optionStr);
            if (dept.nodes && dept.nodes.length > 0) {
                recursiveRenderDeptSelect(dept.nodes, level + 1);
            }
        });
    }
}

function bindDeptClick() {

    //select选择事件监听
    $("#form-parentKey").change(function parentKeyChange() {
        var parentId = $(this).val();//部门所属上级ID
        var deptId = $("#form-tableKey").val();//当前部门id
        //如果选择的所属上级是当前部门的子级，则不允许
        var childNode = getChildNode(deptList, deptId);
        if (existId(childNode, parentId) || parentId == deptId) {
            var _this = this;
            popComp.alert({title: '选择错误', message: '父级部门不能是当前部门或其子部门!'}).on(function (e) {
                if (typeof $(_this).attr("hook") == "undefined") {
                    //尚未做过选择，重置为默认选择
                    $(_this).val($(_this).children("option:first-child").val());
                } else {
                    //重置为修改之前的选择
                    $(_this).val($(_this).attr("hook"));
                }
            });
        }
    });
    $("#form-submit").on("click", function () {
        //表单验证
        var data = {};
        var serializeArray = $(".form-horizontal").serializeArray();
        $.each(serializeArray, function () {
            data[this.name] = this.value;
        });
        postAjax("api/sys/dept/saveOrUpdate", data,true);//JSON.stringify(data) json 转换为字符串
        var currentNode = $(".node-selected").data("nodeid");
        loadDept(currentNode == null ? 0 : currentNode);//刷新树
    });

    $("#deleteDept").on("click", function () {
        postAjax("api/sys/dept/delete/" + $(".node-selected").data("id"), null,true);//JSON.stringify(data) json 转换为字符串
        loadDept($(".node-selected").data("nodeid") - 1);//刷新树
    });

    $("#insertDept").on("click", function () {
        clickTree({pid: $(".node-selected").data("id"), status: 1});
    });
}

function getChildNode(deptList, deptId) {
    var result;
    if (deptList && deptList.length > 0) {
        $(deptList).each(function (i, dept) {
            if (deptId == dept.id) {
                result = dept.nodes;
            } else if (dept.nodes && dept.nodes.length > 0) {
                result = getChildNode(dept.nodes, deptId);
            }
        });
    }
    return result;
}

function existId(deptList, parentId) {
    var result = false;
    if (deptList && deptList.length > 0) {
        $(deptList).each(function (i, dept) {
            if (parentId == dept.id) {
                result = true;
            } else if (dept.nodes && dept.nodes.length > 0) {
                result = existId(dept.nodes, parentId);
            }
        });
    }
    return result;
}

