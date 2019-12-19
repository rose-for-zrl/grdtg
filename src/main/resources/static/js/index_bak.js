$(function () {
    $('#charts1').css({'width': '100%', 'height': '385px'});
    var charts1 = echarts.init(document.getElementById("charts1"));
    charts1.setOption(option);
});
//设备概览
function getMoteOverview() {
    var result = postAjax("api/device/getMoteOverview", {},false);
    $("#moteOverviewId").empty();
    var insert;
    var Invalid;
    for (var i = 0; i < result.length; i++) {
        var overview = result[i];
        var color =  "infobox-green";
        var icon = "fa fa-cogs";
        if(overview.queryType == "insert"){
            icon = "fa fa-wifi";
            color =  "infobox-green";
            overview.name = "新增-" + overview.name;
        }else if(overview.queryType == "invalid"){
            icon = "glyphicon glyphicon-map-marker";
            overview.name = "无效-" + overview.name;
            if(overview.value > 0){
                color =  "infobox-red";
            }
        }else if(overview.queryType == "warning"){
            icon = "fa fa-ambulance";
            overview.name = "警告-" + overview.name;
            if(overview.value > 0){
                color =  "infobox-purple";
            }
        }
        var infoBox = getButton(overview,color,icon);
        $("#moteOverviewId").append(infoBox);
    }
}

function getButton(overview, color,icon) {
    var infobox = $("<div class=\"infobox "+color+"\">");
    var infobox_icon = $("<div class=\"infobox-icon\">");
    var ace_icon = $("<i class=\"ace-icon "+icon+"\">");
    infobox_icon.append(ace_icon);
    infobox.append(infobox_icon);
    var infobox_data = $("<div class=\"infobox-data\">");
    var infobox_data_number = $("<span class=\"infobox-data-number\">"+overview.value+"</span>");
    var infobox_content = $("<div class=\"infobox-content\">"+overview.name+"</div>");
    infobox_data.append(infobox_data_number);
    infobox_data.append(infobox_content);
    infobox.append(infobox_data);
    if(overview.percent != null){
        var stat = $("<div class=\"stat stat-success\">" + overview.percent + "</div>");
        infobox.append(stat);
    }
    return infobox;
}

//index页面获取并组装饼图数据
function getTrafficSources() {
    var colors = ["#68BC31", "#2091CF", "#AF4E96", "#DA5430", "#FEE074"];
    var data = [];
    var result = postAjax("api/device/getTrafficSources", {},false);
    for (var i = 0; i < result.length; i++) {
        var temp = {};
        temp.label = result[i].INFO_VALUE;
        temp.data = result[i].NUM;
        temp.id = result[i].DEVICE_TYPE;
        temp.num = result[i].NUM;
        // temp.colors = colors[i]; //可设置也可默认
        data[i] = temp;
    }
    ;
    return data;
}

//绘制饼图
function drawPieChart(placeholder, data, position) {
    $.plot(placeholder, data, {
        series: {
            pie: {
                show: true,
                tilt: 0.8,
                highlight: {
                    opacity: 0.25
                },
                stroke: {
                    color: '#fff',
                    width: 2
                },
                startAngle: 2
            }
        },
        legend: {
            show: true,
            position: position || "ne",
            labelBoxBorderColor: null,
            margin: [-30, 15],
            labelFormatter: function (label, series) {
                return '<a href="lora/' + series.id + '" mce_href="lora/' + series.id + '">' + label + "(" + series.num + ")" + '</a>';
            }
        }
        ,
        grid: {
            hoverable: true,
            clickable: true
        }
    })
}
