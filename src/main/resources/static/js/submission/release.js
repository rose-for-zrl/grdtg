jQuery(function ($) {
    initCompany("form-company");//公司下拉
    var codeInfoList = initStatue("form-status","submissionStstus");//初始化稿件状态下拉
    $("#form-status").val(2);
    var myTable = initSubmissionTable(codeInfoList,'release'); //表格初始化

    $('#form-search').on("click", function () {
        myTable.draw();//搜索方法  让datatables执行一次提交ajax
    });
});

