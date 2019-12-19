jQuery(function ($) {
    initCompany("form-company");//公司下拉
    var dealStatus = initStatue("form-dealStatus","taskFlowDealStatus");//初始化处理状态
    $("#form-dealStatus option[value='notTask']").attr("selected", true);
    var dealResult =postAjax('api/sys/code/query/'+"taskFlowDealResult", null, false).codeInfoList; //处理结果
    initDate();//初始化时间字段
    var myTable = initAproveTable(dealStatus,dealResult); //表格初始化

    $('#form-search').on("click", function () {
        myTable.draw();//搜索方法  让datatables执行一次提交ajax
    });
});

function initAproveTable(dealStatus,dealResult) {
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
            {"data": "tableKey", title: "主键"},
            {"data": "taskNo", title: "工作流ID"},
            {"data": "busiId", title: "申请单号", width: "10%"},
            {"data": "companyName", title: "所属公司"},
            {"data": "taskDesc", title: "描述"},
            {"data": "dealStatus", title: "处理状态"},
            {"data": "dealUserName", title: "处理人"},
            {"data": "dealResult", title: "处理结果"},
            {"data": "insertTime", title: "创建时间"},
            {"data": "dealTime", title: "处理时间"},
            {"data": "finishTime", title: "处理完成时间"},
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
                "data": "tableKey",
                "visible": false,
                "searchable": false
            },
            {
                "targets": 5, //dealStatus
                "mRender": function (data, type, full) {
                    var value = "";
                    $.each(dealStatus,function (i,code) {
                        if(data == code.infoCode){
                            value =  code.infoValue;
                            return false;
                        }
                    })
                    return value;
                }
            },
            {
                "targets": 7, //dealResult
                "mRender": function (data, type, full) {
                    var value = "";
                    $.each(dealResult,function (i,code) {
                        if(data == code.infoCode){
                            value =  code.infoValue;
                            return false;
                        }
                    })
                    return value;
                }
            },
            {
                "targets": 11,
                "data": null,
                "render": function (data, type, row) {
                    var busiId = row.busiId; //
                    var tableKey = row.tableKey; //主键
                    var insertTime = row.insertTime; //创建时间
                    var dealNodeId = row.dealNodeId; //处理节点
                    var dealResult = row.dealResult; //审核结果
                    var html = "<div class='hidden-sm hidden-xs action-buttons'>";
                    html += "<span href='#modal-submission-aprove' data-toggle='modal' data-deal_node_id='" + dealNodeId+ "' data-table_key='"+tableKey+"' data-busi_id='"+busiId+"' data-deal_result='"+dealResult+"' class='label label-success arrowed-in arrowed-in-right'><i class='ace-icon fa fa-pencil-square-o'></i>  审核</span>"
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
            var result = postAjax("api/flow/query", param, false);
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
    return $("#dynamic-table").DataTable(jqOption);//此处需调用api()方法,否则返回的是JQuery对象而不是DataTables的API对象
}