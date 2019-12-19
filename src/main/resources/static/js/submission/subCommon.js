//初始化公司下拉
function initCompany(id) {
    var deptList = postAjax('api/sys/dept/tree/集体企业', null, false);
    $('#' + id).empty();
    $('#' + id).append("<option value=''>-</option>");
    if ($.isArray(deptList) && deptList.length > 0) {
        recursiveRenderDeptSelect(deptList, 1, id);
    }
}

//标签初始化
function initTags(id, labelInit) {
    let tags = $("input[data-role=tagsinput], select[multiple][data-role=tagsinput]");
    tags.tagsinput({
        maxTags: 5    //标签允许最大输入个数为5
    });
    if (labelInit != null) {
        tags.tagsinput('add', labelInit);
    }
}

function initStatue(id, codeInfoId) {
    var codeInfo = postAjax('api/sys/code/query/' + codeInfoId, null, false);
    $('#' + id).empty();
    $('#' + id).append("<option value=''>-</option>");
    $.each(codeInfo.codeInfoList, function (i, code) {
        var optionStr = "<option value='" + code.infoCode + "'> " + code.infoValue + "</option>";
        $('#' + id).append(optionStr);
    });
    return codeInfo.codeInfoList;
}

//初始化日期下拉
function initDate() {
    var date = new Date();
    $(".date-picker").datetimepicker({
        format: 'yyyy-mm-dd',
        endDate: date, //不能选择未来的日期
        weekStart: 1,
        autoclose: true,
        minView: 2,  //最精确的时间  0：hour
        todayBtn: "linked",
        todayHighlight: true, //当天日期高亮
        language: "zh-CN"
    });
}

//渲染公司下拉
function recursiveRenderDeptSelect(deptList, level, id) {
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
            $('#' + id).append(optionStr);
            if (dept.nodes && dept.nodes.length > 0) {
                recursiveRenderDeptSelect(dept.nodes, level + 1, id);
            }
        });
    }
}

function initAnnex(annexs) {
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
            if(value.libType.indexOf("image") != -1){
                initialPreview.push("<img src='" + value.downloadUrl + "' style='max-width:100%;max-height:100%' class='file-preview-image' alt='" + value.libName + "' title='" + value.libName + "'>");
            }else{
                initialPreview.push("<a href='" + value.downloadUrl + "' alt='" + value.libName + "' title='" + value.libName + "'>");
            }
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

function fileUploadSuccess(event, data) {
    var result = data.response.data;
    var filenames = data.filenames, files = data.files, extra = data.extra;
    if (result != null) {
        for (var i = 0; i < result.length; i++) {
            if (result[i].success) {
                var libId = result[i].libId, currentPreviewId = result[i].previewId;
                $(".kv-preview-thumb[data-fileid='"+currentPreviewId+"']").attr("data-libid", libId);
            } else {
                //todo 调用删除当前节点
            }
        }
    }



}

function initTinyMCE() {
    // Prevent Bootstrap dialog from blocking focusin
    $(document).on('focusin', function (e) {
        if ($(e.target).closest(".tox-tinymce-aux, .moxman-window, .tam-assetmanager-root").length) {
            e.stopImmediatePropagation();
        }
    });
    let initTiny = tinymce.init({
        language: "zh_CN",
        selector: "#submission-content",
        autoresize_bottom_margin: 200,
        menubar: false,//禁用菜单栏 //启用菜单栏并显示如下项 [文件 编辑 插入 格式 表格] 'file edit insert view format table',
        branding: false,//隐藏右下角
        convert_urls: false, // 默认为true,这意味着url将被迫是绝对或相对取决于relative_urls的状态。
        plugins: [
            "advlist autolink lists link image imagetools charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste imagetools wordcount",
            "code paste",
            "autoresize print"
        ],
        toolbar: "insertfile undo redo | styleselect | fontsizeselect | fontselect | bold italic underline strikethrough | forecolor backcolor  cleanformatting | alignleft aligncenter alignright alignjustify " +
            "| bullist numlist outdent indent | link image media table emoticons charmap | code fullscreen preview print",
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
        },
    });
    return initTiny;
}

function selectLocalImages(file) {
    xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.open('POST', getLibraryUploadPath());
    var formData = new FormData();
    formData.append('richTextFile', file);
    formData.append("reportGroupId", "submission-richtext");
    formData.append("dstFileName", "richTextFile");
    xhr.send(formData);
    return xhr;
}

function initSubmissionTable(codeInfoList, pageTitle) {
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
            {"data": "submissionId", title: "申请单号", width: "10%"},
            {"data": "title", title: "标题"},
            {"data": "companyName", title: "所属公司"},
            {"data": "applyUserPhone", title: "电话号码"},
            {"data": "label", title: "标签"},
            {"data": "status", title: "稿件状态"},
            {"data": "insertTime", title: "申请时间"},
            {"data": "passTime", title: "审核通过时间"},
            {"data": null, title: "操作", width: "8%"}
        ],
        columnDefs: [
            {
                "targets": 4,
                "mRender": function (data, type, full) {
                    var dateString = "";
                    if (data != '' && data != null) {
                        var labelLst = data.split(",");
                        $.each(labelLst, function (index, value) {
                            dateString += "<span class='label label-sm label-success arrowed arrowed-righ'>" + value + "</span>";
                        })
                    }
                    return dateString;
                }
            },
            {
                "targets": 5,
                "mRender": function (data, type, full) {
                    var value = "无法识别";
                    $.each(codeInfoList, function (i, code) {
                        if (data == code.infoCode) {
                            value = code.infoValue;
                            return false;
                        }
                    })
                    return value;
                }
            },
            {
                "targets": 8,
                "data": null,
                "render": function (data, type, row) {
                    var submissionId = row.submissionId;
                    var status = row.status; //审核结果
                    // var html = "<div class='hidden-sm hidden-xs action-buttons'>";
                    // html += "<a href='javascript:void(0);' onclick='queryUser(\"" + submissionId + "\")' class='blue'><i class='ace-icon fa fa-search-plus bigger-130'></i></a>"
                    // html += "<a href='javascript:void(0);' onclick='updateUser(\"" + submissionId + "\")' class='green'><i class='ace-icon fa fa-pencil bigger-130'></i></a>"
                    // html += "<a href='javascript:void(0);' onclick='resetPassword(\"" + submissionId + "\")' class='green'><i class='ace-icon fa fa-key bigger-130'></i></a>"
                    // html += "</div>";
                    var html = "<div class='hidden-sm hidden-xs action-buttons'>";
                    html += "<span href='#modal-submission-detail' data-toggle='modal' data-submission_id='" + submissionId + "' class='badge badge-info tooltip-info' data-rel='tooltip' data-placement='bottom' title='查看详情'><i class='ace-icon fa fa-search-plus'></i></span>";
                    if (pageTitle == 'subCompleted' && (status == 0 || status == 4)) { //如果是草稿或返修状态，可跳转到提单页面 且是我的提单页面
                        html += "<span onclick='toSubmission(\"" + submissionId + "\")' class='badge badge-success tooltip-success' data-rel='tooltip'  data-placement='bottom' title='继续修改'><i class='ace-icon fa fa-pencil-square-o'></i></span>";
                    }
                    if (pageTitle == 'release' && status == 2) { //发布页面，且审核通过状态
                        html += "<span onclick='release(\"" + submissionId + "\")' class='badge badge-success tooltip-success' data-rel='tooltip'  data-placement='bottom' title='发布'><i class='ace-icon fa fa-gavel'></i></span>";
                    }
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
            var result = postAjax("submission/manage/queryLst", param, false);
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

/**
 * 检查是否所有附件都上传完成,并返回所有的lst;
 */
function checkFile() {
    var fileLst = [];
    $(".file-preview-thumbnails.clearfix").children(".kv-preview-thumb").each(function () {
        let libId = $(this).attr("data-libId");
        let fileid = $(this).attr("data-fileid");
        if (fileid.indexOf("init") == -1) { //忽略初始化附件
            if (typeof (libId) == "undefined") {
                fileLst = null;
                popComp.alert("存在未上传附件，请上传后再提交");
                return false;
            } else {
                fileLst.push(libId);
            }
        }
    });
    return fileLst;
}

/**
 * 跳转到提单页面
 */
function toSubmission(submissionId) {
    var tuSub = "submission/submissioning?" + window.btoa("submissionId=" + submissionId); //使用encodeURI编码
    window.location.href = tuSub;
}

/**
 *
 */
function release(submissionId) {
    console.info("发布" + submissionId);
    popComp.confirm("是否发布当前文稿？").on(function (e) {
        if (!e) {
            return false;
        }
        postAjax("submission/manage/release/" + submissionId, null, true);
    })
}