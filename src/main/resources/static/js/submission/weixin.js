jQuery(function ($) {
    initAnnex_weixin(null);//附件上传
    initTinyMCE_weixin();//富文本
    formSubmissionValidator();//表单校验
    $("#submission-applyBtn").on("click", function () {
        $('#form-submission').data('bootstrapValidator').validate();
        if (!$("#form-submission").data("bootstrapValidator").isValid()) {
            return false;
        }
        apply(1);
    });

    var u = navigator.userAgent, app = navigator.appVersion;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端或者uc浏览器 
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端 
    if(isAndroid){
      //  $("#submission-annex").attr('capture','camera');
        $("#submission-annex").attr('accept','image/*,audio/*,video/*');
    }
});

function initAnnex_weixin(annexs) {
    let file = $("#submission-annex");
    file.fileinput('destroy');
    let param = {
        uploadUrl: getLibraryUploadPath(), // you must set a valid URL here else you will get an error
        uploadAsync: true,//false:同步上传
        showUpload:false,
        theme: 'gly',
        language: 'zh',
        dropZoneEnabled: false,//是否显示拖拽区域
        dropZoneTitle: '可以将图片拖放到这里 …支持多文件上传',
        showPreview: true, //是否显示预览
        showClose: false, // 隐藏右上角×
        showCaption: false,//是否显示标题
        browseClass: "btn btn-info", //按钮样式
        maxFileSize: 0,  // 上传文件大小限制 为0则不限制
        maxFilesNum: 10, //最大文件数量
        minFileCount: 1, //每次上传允许的最少文件数
        maxFileCount: 10,//控制一次允许上传的最大文件数
        overwriteInitial: true,//覆盖已经存在的文件
        enctype: 'multipart/form-data',
        allowedPreviewTypes: ['image', 'html', 'text', 'video', 'audio', 'flash'],
        msgFilesTooMany: "选择上传的文件数量({n}) 超过允许的最大数值{m}！",
        autoOrientImage: false,
        overwriteInitial: false, //防止预加载图片后。再上传图片时，之前的全部没有
        slugCallback: function (filename) {
            return filename.replace('(', '_').replace(']', '_');
        },
        uploadExtraData: function (previewId, index) {
            var data = {
                "reportGroupId": "submission-annex",      //此处自定义传参
                "dstFileName": "annex", //input标签的name属性
                "applyUserId": $("#submission-applyUserId").val(),
                "previewId": previewId
            };
            return data;
        }
    };
    if (annexs != null) { //初始化附件
        let initialPreview = [], initialPreviewConfig = [];
        $.each(annexs, function (index, value) {
            initialPreview.push("<a href='" + value.downloadUrl + "' alt='" + value.libName + "' title='" + value.libName + "'>");
            initialPreviewConfig.push({
                caption: value.libName,
                width: '50px',
                url: getLibraryDelete(value.libId), // server delete action
                key: value.libId,
                extra: {id: value.libId},
            });
        })
        param["initialPreview"] = initialPreview;
        param["initialPreviewConfig"] = initialPreviewConfig;
    }
    file.fileinput(param).on("fileuploaded", function (event, data) {//异步的回调
        fileUploadSuccess(event, data);
    }).on("filebatchuploadsuccess", function (event, data) {//同步的回调
        fileUploadSuccess(event, data);
    });
    //filebatchpreupload 同步批量上传前 filepreupload普通上传前
}

function apply(status) {
    var param = {};
    var serializeArray = $("#form-submission").serializeArray();
    $.each(serializeArray, function () {
        param[this.name] = this.value;
    });

    var fileLst = checkFile();
    if (fileLst != null) {
        param["fileLst"] = fileLst; //附件ID
        param["content"] = tinymce.activeEditor.getContent(); //获取tinymce编辑器的内容
        param["status"] = status;//1 :提交申请  0：保存草稿
        console.info(param);
        popComp.confirm({
            "title": "提交文稿",
            "message": "是否确认提交?"
        }).on(function (e) {
            if (!e) {
                return false;
            }
            if (postAjaxWeiXin("submission/manage/weixin/apply", param, false)) {
                popComp.alert("提交成功");
            }
        })
    } else {
        return false;
    }
    return true;
}

function initTinyMCE_weixin() {
    // Prevent Bootstrap dialog from blocking focusin
    $(document).on('focusin', function (e) {
        if ($(e.target).closest(".tox-tinymce-aux, .moxman-window, .tam-assetmanager-root").length) {
            e.stopImmediatePropagation();
        }
    });
    tinymce.init({
        language: "zh_CN",
        selector: "#submission-content",
        autoresize_bottom_margin: 100,
        menubar: false,//禁用菜单栏 //启用菜单栏并显示如下项 [文件 编辑 插入 格式 表格] 'file edit insert view format table',
        branding: false,
        convert_urls: false, // 默认为true,这意味着url将被迫是绝对或相对取决于relative_urls的状态。
        plugins: [
            "advlist autolink lists link image imagetools charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste imagetools wordcount",
            "code paste",
            "autoresize"
        ],
        toolbar: "bold italic underline strikethrough | forecolor backcolor  cleanformatting | insertfile undo redo | styleselect | fontsizeselect | fontselect | alignleft aligncenter alignright alignjustify " +
            "| bullist numlist outdent indent | link image media table emoticons charmap | code fullscreen preview ",
        font_formats: '宋体=宋体;黑体=黑体;仿宋=仿宋;楷体=楷体;隶书=隶书;幼圆=幼圆;微软雅黑=微软雅黑; Andale Mono=andale mono,times;' +
            'Arial=arial, helvetica,sans-serif;Arial Black=arial black, avant garde;',
        imagetools_cors_hosts: ['localhost:8090', '172.19.10.238:8090'], //跨域受支持的地址
        imagetools_credentials_hosts: ['localhost:8090', '172.19.10.238:8090'], //凭证 和imagetools_cors_hosts一起使用
        imagetools_toolbar: "rotateleft rotateright | flipv fliph | editimage imageoptions",
        images_upload_handler: function (blobInfo, success, failure) {
            selectLocalImages(blobInfo.blob()).onload = function () {
                var json;
                if (xhr.status < 200 || xhr.status >= 300) {
                    failure('HTTP Error: ' + xhr.status);
                    return;
                }
                json = JSON.parse(xhr.responseText);
                if (!json || !json.data || json.status != 200 || typeof json.data[0].libId != 'string') {
                    failure('无效的上传: ' + json.msg);
                    return;
                }
                success(getLibraryDownload(json.data[0].libId));
            };
        },
        media_live_embeds: true,
        file_picker_types: 'file media',
        file_picker_callback: function (cb, value, meta) {
            let fileUploadControl = document.getElementById("photoFileUpload");
            fileUploadControl.click();
            fileUploadControl.onchange = function () {
                if (fileUploadControl.files.length > 0) {
                    let file = fileUploadControl.files[0];//只选取第一个文件。如果要选取全部，后面注意做修改
                    selectLocalImages(file).onload = function () {
                        var json;
                        if (xhr.status < 200 || xhr.status >= 300) {
                            failure('HTTP Error: ' + xhr.status);
                            return;
                        }
                        json = JSON.parse(xhr.responseText);
                        if (!json || !json.data || json.status != 200 || typeof json.data[0].libId != 'string') {
                            failure('无效的上传: ' + json.msg);
                            return;
                        }
                        let mediaLocation = getLibraryDownload(json.data[0].libId);
                        cb(mediaLocation, {title: file.name});
                    }
                }
            }
        }
    });
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
            applyUserName: {
                validators: {
                    notEmpty: {
                        message: '作者不允许为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 20,
                        message: '作者在2-20个字之间'
                    },
                    regexp: {
                        regexp: /^([\u4e00-\u9fa5]{1,20}|[a-zA-Z\.\s]{1,20})$/,
                        message: '作者由字母或者汉字组成'
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