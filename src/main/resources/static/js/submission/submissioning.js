jQuery(function ($) {
    formSubmissionValidator();//表单校验
    initCompany("submission-company");//公司下拉
    initUserInfo();//用户信息

    //获取参数
    var paramsString = window.location.search;
    var paramsString = paramsString.substring(1);
    var decodeData = window.atob(paramsString)//解码。
    if (decodeData != null && decodeData != "") {
        //加载数据
        var submissionId = decodeData.split("=")[1];
        let detail = postAjax('submission/manage/queryDetail', {"busiId": submissionId}, false);
        if (detail != null) {
            $("#submission-submissionId").val(detail.submissionId);
            $("#submission-title").val(detail.title);
            $("#submission-applyUserId").val(detail.applyUserId);
            $("#submission-phone").val(detail.applyUserPhone);
            $("#submission-remark").val(detail.remark);
            initTags("submission-label", detail.label);
            $("#submission-company option[value='"+detail.company+"']").attr("selected", true);
            initAnnex(detail.annexes);
            initTinyMCE();//富文本
            $("#submission-content").html( detail.content);
        }
    } else {
        initTags("submission-label", null);//标签
        initAnnex(null);//附件上传
        initTinyMCE();//富文本
    }
    $("#submission-applyBtn").on("click", function () {
        $('#form-submission').data('bootstrapValidator').validate();
        if (!$("#form-submission").data("bootstrapValidator").isValid()) {
            return false;
        }
        return apply(1);
    })
    $("#submission-reset").on("click", function () {
        $('#form-submission').data('bootstrapValidator').validate();
        if (!$("#form-submission").data("bootstrapValidator").isValid()) {
            return false;
        }
        return apply(0);
    })
});

function apply(status) {
    var param = {};
    var serializeArray = $("#form-submission").serializeArray();
    $.each(serializeArray, function () {
        param[this.name] = this.value;
    });
    param["company"] = $("#submission-company").val();//组织机构

    var fileLst = checkFile();
    if (fileLst != null) {
        param["fileLst"] = fileLst; //附件ID
        param["content"] = tinymce.activeEditor.getContent(); //获取tinymce编辑器的内容
        param["status"] = status;//1 :提交申请  0：保存草稿
        popComp.confirm({
            "title": "提交文稿",
            "message": "是否确认提交?"
        }).on(function (e) {
            if (!e) {
                return false;
            }
            if (postAjax("submission/manage/apply", param, false)) {
                popComp.alert("提交成功").on(function (e) {
                    location.reload();
                })
            }

        })
    } else {
        return false;
    }
}

function formSubmissionValidator() {
    $("#form-submission").bootstrapValidator({
        // excluded:[':hidden'] ,
        message: '表单基本校验',
        submitButtons: '#submission-applyBtn',
        /**
         * 为每个字段设置统一触发验证方式（也可在fields中为每个字段单独定义），默认是live配置的方式，数据改变就改变
         * 也可以指定一个或多个（多个空格隔开） 'focus blur keyup'
         */
        trigger: 'blur',
        feedbackIcons: {
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            title: {
                message: '标题校验',
                validators: {
                    notEmpty: {
                        message: '标题不能为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 100,
                        message: '标题在2-100个字之间'
                    }
                }
            },
            applyUserPhone: {
                message: '电话号码校验',
                validators: {
                    notEmpty: {
                        message: '手机号不能为空'
                    },
                    phoneNumberCheck: {
                        message: '手机号码有误，请重新输入'
                    }
                }
            }
        }
    });
}

//初始化当前用户信息
function initUserInfo() {
    var currentUser = postAjax('api/sys/users/queryCurrentUser', null, false);
    $('#submission-company').val(currentUser.deptId);
    $('#submission-applyUserId').val(currentUser.userId);
    $('#submission-applyUserName').val(currentUser.userName);
    $('#submission-phone').val(currentUser.phoneNumber);
}
