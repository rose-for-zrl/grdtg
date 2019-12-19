
//打开设备历史记录线性图
//modalId 需要查询的内容
var time;
function getCollenctionHis(deviceId, modalId, title, deviceType) {
    if($('#table-left').is('.col-xs-12')){
        //如果有的修改类的状态
        $('#table-left').removeClass('col-xs-12');
        $('#table-left').addClass('col-xs-6');
        $('#widget-box-id').addClass('col-xs-6');
        $('#widget-box-id').removeAttr('hidden');
    }
    $('#moteNameId').text(title);
    //根据设备id，获取最近一周的历史数据
    var startDate = getBeforeDate(-6);
    var endDate = getBeforeDate(1);
    // var result = postAjax("device/sendToLora", {moteEui: deviceId}); //发送请求到设备等待获取最新数据
    var data = postAjax("revicedata/historyLatest", {deviceId: deviceId},false); //查询该设备的最新一条数据
    // 如果data.latestReviceData返回数据为空，则显示一个图片。。。
    var img = $("<img id=\"emptyPitureId\" src=\""+getProjectName()+"/static/assets/images/empty.jpg\">");
    if(jQuery.isEmptyObject(data.latestReviceData)){
        $('#widget-box-id').prop('hidden',true);
        if($('#emptyPitureId').length <=0)
            $('#widget-box-id').append(img);
    }else{
        $('#widget-box-id').prop('hidden',false);
        var  imgDom = $('#widget-box-id').children('img');
        if($('#emptyPitureId').length>0){
            $('#emptyPitureId').remove();
        }
    }
    console.info(data);
    //数据初始化
    var chartId = "device-" + deviceType + "-charts";
    if(time != null) {
        clearInterval(time);
    }
    if (deviceType == '09') {//烟雾探测
        time = createOptions_09(chartId, data.latestReviceData);
    }else if(deviceType == '0C' || deviceType == '0D'){//光照温湿度
        chartId = "device-0C-charts";
        time = createOptions_0C(chartId, data.latestReviceData);
    }else if(deviceType == '0E'){//PH2.5
        time = createOptions_0E(chartId, data.latestReviceData);
    }else if(deviceType == '0F'){//线缆测温
        time = createOptions_0F(chartId, data.latestReviceData);
    }
}

//线缆测温
function createOptions_0F(chartId, data) {
    $('#' + chartId).css({'width': '100%', 'height': '385px'});
    var dataOption = new Array();
    $.each(data, function (key, values) {
        if( values.temperature != null){
            dataOption.temperature = values.temperature;
        }
        if(values.latestPower != null){
            dataOption.latestPower = values.latestPower;
        }
    });
    //设置图标下具体参数显示
    initMoteGrey_0F(dataOption.temperature,dataOption.latestPower);
    var myChart = echarts.init(document.getElementById(chartId));
    var option = {
        tooltip: {
            formatter: "{a} <br/>{c} {b}",
            backgroundColor: "rgba(10,50,50,0.6)",
            borderColor: "#333",
            borderWidth: 0,
            padding: 5
        },
        toolbox: {
            show: true,
            feature: {
                restore: {show: false},
                saveAsImage: {show: true}
            }
        },
        series: [
            {
                name: '温度',
                type: 'gauge',
                z: 3,
                min: 0,
                max: 40,
                splitNumber: 5,
                radius: '50%',
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: [[0.7, '#91c7ae'], [1, '#D15B47']],
                        opacity: 1,
                        width: 10
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 15,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                axisLabel: {
                    backgroundColor: 'auto',
                    borderRadius: 2,
                    color: '#eee',
                    padding: 3,
                    textShadowBlur: 2,
                    textShadowOffsetX: 1,
                    textShadowOffsetY: 1,
                    textShadowColor: '#222'
                },
                title: {
                    offsetCenter: [0, "-30%"]//相对于仪表盘中心的偏移位置，数组第一项是水平方向的偏移，第二项是垂直方向的偏移。可以是绝对的数值，也可以是相对于仪表盘半径的百分比。
                },
                detail: {
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    formatter: function (value) {
                        return "当前温度";
                    },
                    fontSize: 14,
                    fontFamily: 'Arial',
                    width: 30,
                    fontWeight: 'normal',
                    rich: {}
                },
                data: [{value: dataOption.temperature, name: '°C'}]
            },
            {
                name: '发送电压',
                type: 'gauge',
                center: ['80%', '55%'],    // 默认全局居中
                radius: '35%',
                min: 0,
                max: 10,
                endAngle: 45,
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color:[[0.3,'#c23531'],[0.7, '#E2A684'],[0.78, '#63869e'],[1, '#91c7ae']],
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail: {
                    formatter: function (value) {
                        return "发送电压";
                    },
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'normal',
                    fontSize: 12
                },
                data: [{value: dataOption.latestPower, name: ' V'}]
            }
        ]
    };
    myChart.setOption(option);
    return setInterval(function () {
        var s = randomNum(-0.5,0.5,2);
        option.series[0].data[0].value = (parseFloat(dataOption.temperature) + parseFloat(s)).toFixed(2);//随机状态
        option.series[1].data[0].value = (parseFloat(dataOption.latestPower) + parseFloat(s)).toFixed(2);
        myChart.setOption(option);
        initMoteGrey_0F(option.series[0].data[0].value, option.series[1].data[0].value);
    }, 3000);
}

//PH2.5
function createOptions_0E(chartId, data) {
    $('#' + chartId).css({'width': '100%', 'height': '385px'});
    var dataOption = new Array();
    $.each(data, function (key, values) {
        if( values.pmOne != null){
            dataOption.pmOne = values.pmOne;
        }
        if(values.twoAndHalf != null){
            dataOption.twoAndHalf = values.twoAndHalf;
        }
        if(values.pmTen != null){
            dataOption.pmTen = values.pmTen;
        }
        if(values.powerState != null){
            dataOption.powerState = values.powerState;
        }
    });
    //设置图标下具体参数显示
    initMoteGrey_0E(dataOption.pmOne,dataOption.twoAndHalf, dataOption.pmTen, dataOption.powerState);
    var myChart = echarts.init(document.getElementById(chartId));
    var option = {
        tooltip: {
            formatter: "{a} <br/>{c} {b}",
            backgroundColor: "rgba(10,50,50,0.6)",
            borderColor: "#333",
            borderWidth: 0,
            padding: 5
        },
        toolbox: {
            show: true,
            feature: {
                restore: {show: false},
                saveAsImage: {show: true}
            }
        },
        series: [
            {
                name: 'PM2.5',
                type: 'gauge',
                z: 3,
                min: 0,
                max: 160,
                splitNumber: 10,
                radius: '50%',
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: [[0.3125, '#91c7ae'], [0.625, '#EED8AE'], [1, '#D15B47']],
                        opacity: 1,
                        width: 10
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 15,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                axisLabel: {
                    backgroundColor: 'auto',
                    borderRadius: 2,
                    color: '#eee',
                    padding: 3,
                    textShadowBlur: 2,
                    textShadowOffsetX: 1,
                    textShadowOffsetY: 1,
                    textShadowColor: '#222'
                },
                title: {
                    offsetCenter: [0, "-30%"]//相对于仪表盘中心的偏移位置，数组第一项是水平方向的偏移，第二项是垂直方向的偏移。可以是绝对的数值，也可以是相对于仪表盘半径的百分比。
                },
                detail: {
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    formatter: function (value) {
                        return "PH2.5";
                    },
                    fontSize: 14,
                    fontFamily: 'Arial',
                    width: 30,
                    fontWeight: 'normal',
                    rich: {}
                },
                data: [{value: dataOption.twoAndHalf, name: 'μg/m3'}]
            },
            {
                name: 'PM1.0',
                type: 'gauge',
                center: ['23%', '55%'],    // 默认全局居中
                radius: '35%',
                min: 0,
                max: 160,
                endAngle: -45,
                splitNumber: 8,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color:[[0.3125, '#91c7ae'], [0.625, '#EED8AE'], [1, '#D15B47']],//[[0.45,'#c23531'],[0.7, '#91c7ae'],[1, '#63869e']],
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail: {
                    formatter: function (value) {
                        return "PH1.0";
                    },
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'normal',
                    fontSize: 12
                },
                data: [{value: dataOption.pmOne, name: 'μg/m3'}]
            },
            {
                name: 'PM10',
                type: 'gauge',
                center: ['80%', '55%'],    // 默认全局居中
                radius: '35%',
                min: 0,
                max: 160,
                endAngle: -45,
                splitNumber: 8,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color:[[0.3125, '#91c7ae'], [0.625, '#EED8AE'], [1, '#D15B47']],//[[0.3,'#c23531'],[0.7, '#E2A684'],[0.78, '#63869e'],[1, '#91c7ae']],
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail: {
                    formatter: function (value) {
                        return 'PM10';
                    },
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'normal',
                    fontSize: 12
                },
                data: [{value: dataOption.pmTen, name: 'μg/m3'}]
            }
        ]
    };
    myChart.setOption(option);
    return setInterval(function () {
        var s = randomNum(-4,5,0);
        option.series[0].data[0].value = parseFloat(dataOption.twoAndHalf) + parseFloat(s);//随机状态
        option.series[1].data[0].value = parseFloat(dataOption.pmOne) + parseFloat(s);
        option.series[2].data[0].value = parseFloat(dataOption.pmTen) + parseFloat(s);
        myChart.setOption(option);
        initMoteGrey_0E(option.series[1].data[0].value, option.series[0].data[0].value, option.series[2].data[0].value, dataOption.powerState);
    }, 3000);
}

//光照温湿度
function createOptions_0C(chartId, data) {
    $('#' + chartId).css({'width': '100%', 'height': '385px'});
    var dataOption = new Array();
    $.each(data, function (key, values) {
        if( values.sunlight != null){
            dataOption.sunlight = values.sunlight;
        }
        if( values.humidity != null){
            dataOption.humidity = values.humidity;
        }
        if(values.temperature != null){
            dataOption.temperature = values.temperature;
        }
        if(values.latestPower != null){
            dataOption.latestPower = values.latestPower;
        }
    });
    //设置图标下具体参数显示
    initMoteGrey_0C(dataOption.sunlight,dataOption.temperature, dataOption.humidity, dataOption.latestPower);
    var myChart = echarts.init(document.getElementById(chartId));

    var option = {
        tooltip: {
            formatter: "{a} <br/>{c} {b}",
            backgroundColor: "rgba(10,50,50,0.6)",
            borderColor: "#333",
            borderWidth: 0,
            padding: 5
        },
        toolbox: {
            show: true,
            feature: {
                restore: {show: false},
                saveAsImage: {show: true}
            }
        },
        series: [
            {
                name: '温度',
                type: 'gauge',
                z: 3,
                min: 0,
                max: 40,
                splitNumber: 5,
                radius: '50%',
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: [[0.7, '#91c7ae'], [1, '#D15B47']],
                        opacity: 1,
                        width: 10
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 15,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                axisLabel: {
                    backgroundColor: 'auto',
                    borderRadius: 2,
                    color: '#eee',
                    padding: 3,
                    textShadowBlur: 2,
                    textShadowOffsetX: 1,
                    textShadowOffsetY: 1,
                    textShadowColor: '#222'
                },
                title: {
                    offsetCenter: [0, "-30%"]//相对于仪表盘中心的偏移位置，数组第一项是水平方向的偏移，第二项是垂直方向的偏移。可以是绝对的数值，也可以是相对于仪表盘半径的百分比。
                },
                detail: {
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    formatter: function (value) {
                        return value + " °C";
                    },
                    fontSize: 14,
                    fontFamily: 'Arial',
                    width: 30,
                    fontWeight: 'normal',
                    rich: {}
                },
                data: [{value: dataOption.temperature, name: '温度'}]
            },
            {
                name: '湿度',
                type: 'gauge',
                center: ['23%', '55%'],    // 默认全局居中
                radius: '35%',
                min: 0,
                max: 1,
                endAngle: 45,
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color:[[0.45,'#c23531'],[0.7, '#91c7ae'],[1, '#63869e']],
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail: {
                    formatter: function (value) {
                        return value * 100 + "%";
                    },
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'normal',
                    fontSize: 12
                },
                data: [{value: dataOption.humidity, name: '湿度'}]
            },
            {
                name: '发送电压',
                type: 'gauge',
                center: ['80%', '55%'],    // 默认全局居中
                radius: '35%',
                min: 0,
                max: 10,
                endAngle: 45,
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color:[[0.3,'#c23531'],[0.7, '#E2A684'],[0.78, '#63869e'],[1, '#91c7ae']],
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail: {
                    formatter: function (value) {
                        return value < 3 ? '告警' : (value < 7 ? '低电压': (value < 7.8 ? '足电压' : '满电压'));
                    },
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'normal',
                    fontSize: 12
                },
                data: [{value: dataOption.latestPower, name: '发送电压'}]
            }
        ]
    };
    myChart.setOption(option);
   return setInterval(function () {
        var s = randomNum(0,1,2);
        option.series[0].data[0].value =  (parseFloat(dataOption.temperature) + parseFloat(s)).toFixed(2);//随机状态
        option.series[1].data[0].value = ((dataOption.humidity * 100 + parseFloat( randomNum(0,5,0))).toFixed(2) / 100).toFixed(2);
        option.series[2].data[0].value = parseFloat(dataOption.latestPower) + parseFloat(s);
        myChart.setOption(option);
       initMoteGrey_0C(dataOption.sunlight, option.series[0].data[0].value,option.series[1].data[0].value,option.series[2].data[0].value);
    }, 3000);
}

//烟雾探测 仪表盘加载
function createOptions_09(chartId, data) {
    $('#' + chartId).css({'width': '100%', 'height': '385px'});
    var dataOption = {};
    $.each(data, function (key, values) {
        dataOption.state = values.state;
        dataOption.latest = values.latest;
        dataOption.currentValue = values.currentValue;
    });
    //设置图标下具体参数显示
    initMoteGrey_09(dataOption.latest, dataOption.state, dataOption.currentValue);
    var myChart = echarts.init(document.getElementById(chartId));
    var option = {
        tooltip: {
            formatter: "{a} <br/>{c} {b}",
            backgroundColor: "rgba(10,50,50,0.6)",
            borderColor: "#333",
            borderWidth: 0,
            padding: 5
        },
        toolbox: {
            show: true,
            feature: {
                restore: {show: false},
                saveAsImage: {show: true}
            }
        },
        series: [
            {
                name: '状态',
                type: 'gauge',
                z: 3,
                min: 0,
                max: 1,
                splitNumber: 5,
                radius: '50%',
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: [[0.5, '#91c7ae'], [1, '#D15B47']],
                        opacity: 1,
                        width: 10
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 15,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                axisLabel: {
                    backgroundColor: 'auto',
                    borderRadius: 2,
                    color: '#eee',
                    padding: 3,
                    textShadowBlur: 2,
                    textShadowOffsetX: 1,
                    textShadowOffsetY: 1,
                    textShadowColor: '#222'
                },
                title: {
                    offsetCenter: [0, "20%"],//相对于仪表盘中心的偏移位置，数组第一项是水平方向的偏移，第二项是垂直方向的偏移。可以是绝对的数值，也可以是相对于仪表盘半径的百分比。
                    color: "#fff",          // 文字的颜色,默认 #333。
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'normal',
                    fontSize: 14,
                    fontStyle: 'normal'
                },
                detail: {
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    formatter: function (value) {
                        return value < 0.5 ? '正常' : '警告';
                    },
                    fontSize: 16,
                    fontFamily: 'Arial',
                    width: 30,
                    fontWeight: 'normal',
                    borderRadius: 3,
                    backgroundColor: '#444',
                    borderColor: '#aaa',
                    shadowBlur: 5,
                    shadowColor: '#333',
                    shadowOffsetX: 0,
                    shadowOffsetY: 3,
                    borderWidth: 2,
                    textBorderColor: '#000',
                    textBorderWidth: 2,
                    // textShadowBlur: 2,
                    // textShadowColor: '#fff',
                    textShadowOffsetX: 0,
                    textShadowOffsetY: 0,
                    // color: '#eee',
                    rich: {}
                },
                data: [{value: dataOption.state, name: ''}]
            },
            {
                name: '发送电压',
                type: 'gauge',
                center: ['23%', '55%'],    // 默认全局居中
                radius: '35%',
                min: 0,
                max: 10,
                endAngle: 45,
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color:[[0.3,'#c23531'],[0.7, '#E2A684'],[0.78, '#63869e'],[1, '#91c7ae']],
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail: {
                    formatter: function (value) {
                        return value < 3 ? '告警' : (value < 7 ? '低电压': (value < 7.8 ? '足电压' : '满电压'));
                    },
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'normal',
                    fontSize: 12
                },
                data: [{value: dataOption.latest, name: 'V'}]
            },
            {
                name: '电池电量',
                type: 'gauge',
                center: ['80%', '55%'],    // 默认全局居中
                radius: '35%',
                min: 0,
                max: 10,
                endAngle: 45,
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color:[[0.65,'#c23531'],[0.7, '#E2A684'],[0.78, '#63869e'],[1, '#91c7ae']],
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail: {
                    formatter: function (value) {
                        return value < 6.5 ? '告警' : (value < 7 ? '低电压': (value < 7.8 ? '足电压' : '满电压'));
                    },
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'normal',
                    fontSize: 12
                },
                data: [{value: dataOption.currentValue, name: 'V'}]
            }
        ]
    };
    myChart.setOption(option);
    return setInterval(function () {
        var s = randomNum(0,0.4,2);
        option.series[0].data[0].value = dataOption.state == 0 ? dataOption.state + s : dataOption.state - s;//随机状态
        option.series[1].data[0].value = parseFloat( dataOption.latest) + parseFloat(s);
        option.series[2].data[0].value = parseFloat(dataOption.currentValue) + parseFloat(s);
        myChart.setOption(option);
    }, 3000);
}

//线缆测温初始化
function initMoteGrey_0F(temperature,latestPower){
    createMoteFooter(2);
    //设置标题
    $('#mote-grey0-id').children('span').text('当前温度：');
    $('#mote-grey1-id').children('span').text('发送电压：');
    $('#mote-grey0-id').next().text(temperature +" °C");
    $('#mote-grey1-id').next().text(latestPower < 3 ? '告警' : (latestPower < 7 ? '低电压': (latestPower < 7.8 ? '足电压' : '满电压')));
    //设置图标
    $('#mote-grey0-id').children('i').addClass('fa-heartbeat');
    $('#mote-grey1-id').children('i').addClass('fa-bolt');
    //设置class
    if(temperature < 28) {
        $('#mote-grey0-id').children('i').addClass('blue');
        $('#mote-grey0-id').children('i').removeClass('red');
        $('#mote-grey0-id').next().addClass('blue');
        $('#mote-grey0-id').next().removeClass('red');
    }else{
        $('#mote-grey0-id').children('i').addClass('red');
        $('#mote-grey0-id').children('i').removeClass('blue');
        $('#mote-grey0-id').next().addClass('red');
        $('#mote-grey0-id').next().removeClass('blue');
    }
    if(latestPower < 3) {
        $('#mote-grey1-id').children('i').addClass('red');
        $('#mote-grey1-id').children('i').removeClass('purple');
        $('#mote-grey1-id').children('i').removeClass('blue');
        $('#mote-grey1-id').next().addClass('red');
        $('#mote-grey1-id').next().removeClass('purple');
        $('#mote-grey1-id').next().removeClass('blue');
    }else if (latestPower < 7){
        $('#mote-grey1-id').children('i').addClass('purple');
        $('#mote-grey1-id').children('i').removeClass('red');
        $('#mote-grey1-id').children('i').removeClass('blue');
        $('#mote-grey1-id').next().addClass('purple');
        $('#mote-grey1-id').next().removeClass('red');
        $('#mote-grey1-id').next().removeClass('blue');
    }else{
        $('#mote-grey1-id').children('i').addClass('blue');
        $('#mote-grey1-id').children('i').removeClass('red');
        $('#mote-grey1-id').children('i').removeClass('purple');
        $('#mote-grey1-id').next().addClass('blue');
        $('#mote-grey1-id').next().removeClass('red');
        $('#mote-grey1-id').next().removeClass('purple');
    }
}
//ph2.5初始化处理
function initMoteGrey_0E(pmOne,twoAndHalf, pmTen, powerState){
    createMoteFooter(4);
    //设置标题
    $('#mote-grey0-id').children('span').text('PM1.0：');
    $('#mote-grey1-id').children('span').text('PM2.5：');
    $('#mote-grey2-id').children('span').text('PM10：');
    $('#mote-grey3-id').children('span').text('供电状态');
    $('#mote-grey0-id').next().text(pmOne +"μg/m3");
    $('#mote-grey1-id').next().text(twoAndHalf +"μg/m3");
    $('#mote-grey2-id').next().text(pmTen +"μg/m3");
    $('#mote-grey3-id').next().text(powerState == 0 ? "正常" : "掉电");
    //设置图标 fa-frown-o  fa-meh-o  fa-smile-o
    $('#mote-grey0-id').children('i').addClass('fa-smile-o');
    $('#mote-grey1-id').children('i').addClass('fa-smile-o');
    $('#mote-grey2-id').children('i').addClass('fa-smile-o');
    $('#mote-grey3-id').children('i').addClass('fa-bolt');
    //设置class
    changeClass("mote-grey0-id", pmOne,50,100);
    changeClass("mote-grey1-id", twoAndHalf,50,100);
    changeClass("mote-grey2-id", pmTen,50,100);
    if(powerState == 0){
        $('#mote-grey3-id').children('i').addClass('blue');
        $('#mote-grey3-id').children('i').removeClass('red');
        $('#mote-grey3-id').next().addClass('blue');
        $('#mote-grey3-id').next().removeClass('red');
    }else{
        $('#mote-grey3-id').children('i').addClass('red');
        $('#mote-grey3-id').children('i').removeClass('blue');
        $('#mote-grey3-id').next().addClass('red');
        $('#mote-grey3-id').next().removeClass('blue');
    }
}
function changeClass(idName, pm, value1, value2) {
    if(pm < value1) {
        $('#'+idName).children('i').addClass('fa-smile-o');
        $('#'+idName).children('i').addClass('blue');
        $('#'+idName).children('i').removeClass('red');
        $('#'+idName).children('i').removeClass('grey');
        $('#'+idName).next().addClass('blue');
        $('#'+idName).next().removeClass('red');
        $('#'+idName).next().removeClass('grey');
    }else if(pm < value2){
        $('#'+idName).children('i').addClass('fa-meh-o');
        $('#'+idName).children('i').addClass('grey');
        $('#'+idName).children('i').removeClass('red');
        $('#'+idName).children('i').removeClass('blue');
        $('#'+idName).next().addClass('grey');
        $('#'+idName).next().removeClass('red');
        $('#'+idName).next().removeClass('blue');
    }else{
        $('#'+idName).children('i').addClass('fa-frown-o');
        $('#'+idName).children('i').addClass('red');
        $('#'+idName).children('i').removeClass('blue');
        $('#'+idName).children('i').removeClass('grey');
        $('#'+idName).next().addClass('red');
        $('#'+idName).next().removeClass('blue');
        $('#'+idName).next().removeClass('grey');
    }
}

//光照温湿度初始化处理
function initMoteGrey_0C(sunlight,temperature,humidity,latestPower) {
    createMoteFooter(4);
    //设置标题
    $('#mote-grey0-id').children('span').text('光照度');
    $('#mote-grey1-id').children('span').text('温度');
    $('#mote-grey2-id').children('span').text('湿度');
    $('#mote-grey3-id').children('span').text('发送电压');
    $('#mote-grey0-id').next().text(sunlight +" Lm");
    $('#mote-grey1-id').next().text(temperature +" °C");
    $('#mote-grey2-id').next().text((parseFloat(humidity) * 100).toFixed(2) +"% RH");
    $('#mote-grey3-id').next().text(latestPower < 3 ? '告警' : (latestPower < 7 ? '低电压': (latestPower < 7.8 ? '足电压' : '满电压')));
    //设置图标
    $('#mote-grey0-id').children('i').addClass('fa-lightbulb-o');
    $('#mote-grey1-id').children('i').addClass('fa-heartbeat');
    $('#mote-grey2-id').children('i').addClass('fa-tint');
    $('#mote-grey3-id').children('i').addClass('fa-bolt');
    //设置class
    if(temperature < 28) {
        $('#mote-grey1-id').children('i').addClass('blue');
        $('#mote-grey1-id').children('i').removeClass('red');
        $('#mote-grey1-id').next().addClass('blue');
        $('#mote-grey1-id').next().removeClass('red');
    }else{
        $('#mote-grey1-id').children('i').addClass('red');
        $('#mote-grey1-id').children('i').removeClass('blue');
        $('#mote-grey1-id').next().addClass('red');
        $('#mote-grey1-id').next().removeClass('blue');
    }

    if(humidity > 0.45) {
        $('#mote-grey2-id').children('i').addClass('blue');
        $('#mote-grey2-id').children('i').removeClass('red');
        $('#mote-grey2-id').next().addClass('blue');
        $('#mote-grey2-id').next().removeClass('red');
    }else{
        $('#mote-grey2-id').children('i').addClass('red');
        $('#mote-grey2-id').children('i').removeClass('blue');
        $('#mote-grey2-id').next().addClass('red');
        $('#mote-grey2-id').next().removeClass('blue');
    }
    if(latestPower < 3) {
        $('#mote-grey3-id').children('i').addClass('red');
        $('#mote-grey3-id').children('i').removeClass('purple');
        $('#mote-grey3-id').children('i').removeClass('blue');
        $('#mote-grey3-id').next().addClass('red');
        $('#mote-grey3-id').next().removeClass('purple');
        $('#mote-grey3-id').next().removeClass('blue');
    }else if (latestPower < 7){
        $('#mote-grey3-id').children('i').addClass('purple');
        $('#mote-grey3-id').children('i').removeClass('red');
        $('#mote-grey3-id').children('i').removeClass('blue');
        $('#mote-grey3-id').next().addClass('purple');
        $('#mote-grey3-id').next().removeClass('red');
        $('#mote-grey3-id').next().removeClass('blue');
    }else{
        $('#mote-grey3-id').children('i').addClass('blue');
        $('#mote-grey3-id').children('i').removeClass('red');
        $('#mote-grey3-id').children('i').removeClass('purple');
        $('#mote-grey3-id').next().addClass('blue');
        $('#mote-grey3-id').next().removeClass('red');
        $('#mote-grey3-id').next().removeClass('purple');
    }
}

function initMoteGrey_09(latest,state,currentValue) {
    createMoteFooter(3);
    //设置标题
    $('#mote-grey0-id').children('span').text('发送电压');
    $('#mote-grey1-id').children('span').text('烟雾探测状态');
    $('#mote-grey2-id').children('span').text('电池电量');
    //设置值
    $('#mote-grey0-id').next().text(latest < 3 ? '告警' : (latest < 7 ? '低电压': (latest < 7.8 ? '足电压' : '满电压')));
    $('#mote-grey1-id').next().text(state < 0.5 ? '正常' : '警告');
    $('#mote-grey2-id').next().text(currentValue < 6.5 ? '告警' : (currentValue < 7 ? '低电压': (currentValue < 7.8 ? '足电压' : '满电压')));
    //设置class
    $('#mote-grey0-id').children('i').addClass('fa-bolt');
    if(latest < 3) {
        $('#mote-grey0-id').children('i').addClass('red');
        $('#mote-grey0-id').children('i').removeClass('purple');
        $('#mote-grey0-id').children('i').removeClass('blue');
        $('#mote-grey0-id').next().addClass('red');
        $('#mote-grey0-id').next().removeClass('purple');
        $('#mote-grey0-id').next().removeClass('blue');
    }else if (latest < 7){
        $('#mote-grey0-id').children('i').addClass('purple');
        $('#mote-grey0-id').children('i').removeClass('red');
        $('#mote-grey0-id').children('i').removeClass('blue');
        $('#mote-grey0-id').next().addClass('purple');
        $('#mote-grey0-id').next().removeClass('red');
        $('#mote-grey0-id').next().removeClass('blue');
    }else{
        $('#mote-grey0-id').children('i').addClass('blue');
        $('#mote-grey0-id').children('i').removeClass('red');
        $('#mote-grey0-id').children('i').removeClass('purple');
        $('#mote-grey0-id').next().addClass('blue');
        $('#mote-grey0-id').next().removeClass('red');
        $('#mote-grey0-id').next().removeClass('purple');
    }

    $('#mote-grey1-id').children('i').addClass('fa-fire');
    if(state < 0.5){
        $('#mote-grey1-id').children('i').addClass('blue');
        $('#mote-grey1-id').children('i').removeClass('red');
        $('#mote-grey1-id').children('i').removeClass('purple');
        $('#mote-grey1-id').next().addClass('blue');
        $('#mote-grey1-id').next().removeClass('red');
        $('#mote-grey1-id').next().removeClass('purple');
    }else{
        $('#mote-grey1-id').children('i').addClass('purple');
        $('#mote-grey1-id').children('i').removeClass('red');
        $('#mote-grey1-id').children('i').removeClass('blue');
        $('#mote-grey1-id').next().addClass('purple');
        $('#mote-grey1-id').next().removeClass('red');
        $('#mote-grey1-id').next().removeClass('blue');
    }
    if(currentValue < 6.5) {
        $('#mote-grey2-id').children('i').addClass('red');
        $('#mote-grey2-id').children('i').removeClass('purple');
        $('#mote-grey2-id').children('i').removeClass('blue');
        $('#mote-grey2-id').children('i').addClass('fa-battery-quarter');
        $('#mote-grey2-id').children('i').removeClass('fa-battery-full');
        $('#mote-grey2-id').children('i').removeClass('fa-battery-half');
        $('#mote-grey2-id').next().addClass('red');
        $('#mote-grey2-id').next().removeClass('purple');
        $('#mote-grey2-id').next().removeClass('blue');
    }else if (currentValue < 7){
        $('#mote-grey2-id').children('i').addClass('purple');
        $('#mote-grey2-id').children('i').removeClass('red');
        $('#mote-grey2-id').children('i').removeClass('blue');
        $('#mote-grey2-id').children('i').addClass('fa-battery-half');
        $('#mote-grey2-id').children('i').removeClass('fa-battery-full');
        $('#mote-grey2-id').children('i').removeClass('fa-battery-quarter');
        $('#mote-grey2-id').next().addClass('purple');
        $('#mote-grey2-id').next().removeClass('red');
        $('#mote-grey2-id').next().removeClass('blue');
    }else{
        $('#mote-grey2-id').children('i').addClass('blue');
        $('#mote-grey2-id').children('i').removeClass('red');
        $('#mote-grey2-id').children('i').removeClass('purple');
        $('#mote-grey2-id').children('i').addClass('fa-battery-full');
        $('#mote-grey2-id').children('i').removeClass('fa-battery-quarter');
        $('#mote-grey2-id').children('i').removeClass('fa-battery-half');
        $('#mote-grey2-id').next().addClass('blue');
        $('#mote-grey2-id').next().removeClass('red');
        $('#mote-grey2-id').next().removeClass('purple');
    }
}

function createMoteFooter(length){
    if(length <= 0){
        return ;
    }
    $("#clearfixId").empty();
    for(var i = 0 ; i < length ; i ++ ){
        var grid3= $("<div class=\"grid"+length+"\">");
        var mote_id = $("<span class=\"grey\" id=\"mote-grey"+i+"-id\">");
        var iDom = $("<i class=\"ace-icon fa fa-2x blue \"></i>");
        var moteName = $("<span class=\"blue\"></span>");
        var h4 = $("<h4 class=\"pull-right blue\"></h4>");
        mote_id.append(iDom);
        mote_id.append("&nbsp;&nbsp;");
        mote_id.append(moteName);
        grid3.append(mote_id);
        grid3.append(h4);
        $("#clearfixId").append(grid3);
    }
}
/***************************************
 * 生成从minNum到maxNum的随机数。
 * 如果指定decimalNum个数，则生成指定小数位数的随机数
 * 如果不指定任何参数，则生成0-1之间的随机数。
 *
 * @minNum：[数据类型是Integer]生成的随机数的最小值（minNum和maxNum可以调换位置）
 * @maxNum：[数据类型是Integer]生成的随机数的最大值
 * @decimalNum：[数据类型是Integer]如果生成的是带有小数的随机数，则指定随机数的小数点后的位数
 *
 ****************************************/
function randomNum(maxNum, minNum, decimalNum) {
    var max = 0, min = 0;
    minNum <= maxNum ? (min = minNum, max = maxNum) : (min = maxNum, max = minNum);
    switch (arguments.length) {
        case 1:
            return Math.floor(Math.random() * (max + 1));
            break;
        case 2:
            return Math.floor(Math.random() * (max - min + 1) + min);
            break;
        case 3:
            return (Math.random() * (max - min) + min).toFixed(decimalNum);
            break;
        default:
            return Math.random();
            break;
    }
}