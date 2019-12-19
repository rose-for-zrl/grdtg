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
            {"data": "tableKey", title: "tableKey"},
            {"data": "host", title: "IP地址"},
            {"data": "port", title: "端口号"},
            {"data": "publicAddr", title: "公共地址"},
            {"data": "address", title: "遥测信息对象地址"},
            {"data": "insertTime", title: "监测时间"},
            {"data": "elementValue", title: "信息元素值"},
            {"data": "timeScale", title: "品质描述词QDS"},
            {"data": "timeScale", title: "带CP56Time2a时标"},
            {"data": "isValid", title: "是否有效"},
            {"data": "currentValue", title: "是否当前值"},
            {"data": "hasReplace", title: "是否被取代"},
            {"data": "isClose", title: "是否闭锁"},
            {"data": "isSwitch", title: "开关合/分"}
        ],
        columnDefs: [
            {
                "targets": 0, //第一列隐藏
                "data": "tableKey",
                "visible": false,//不可见
                "searchable": false
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
            var result = postAjax("api/z100/queryPoint", param, false);
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
    //初始化表格
    var myTable = $("#dynamic-table").DataTable(jqOption);//此处需调用api()方法,否则返回的是JQuery对象而不是DataTables的API对象
});