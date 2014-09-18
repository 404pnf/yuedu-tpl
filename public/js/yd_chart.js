// ## jslint配置 不要删除
/*jslint vars: true, browser: true , devel: true, nomen: true, indent: 2*/
/*global $, jQuery, EJS, _, AmCharts*/

var ydMakeChart;

ydMakeChart = function () {
  "use strict";

  var drawChart,
    onFailure;


  drawChart = function (data) {
    AmCharts.makeChart("chartdiv", {
      type: "serial",
      theme: "light",
      dataProvider: data,

      categoryField: "date",
      startDuration: 1,
      rotate: false, // 是否x轴和y轴互换

      categoryAxis: {
          //gridPosition: "start"
      },
      graphs: [{
        type: "column",
        columnWidth: 0.3, // 设定column的宽度 区间是 0 .. 1 相对宽度
        title: "",
        valueField: "value",
        urlField: "url",
        fillAlphas: 1,
        balloonText: "[[date]]<br><b><span style='font-size:24px;'>[[value]]</span></b><br><b><span style='font-size:24px;'>点击查看详情</span></b>"
      }, {
        type: "line",
        title: "",
        valueField: "value",
        urlField: "url",
        lineThickness: 6,
        bullet: "round",
        bulletSize: 20,
        balloonText: "[[date]]<br><b><span style='font-size:24px;'>[[value]]</span></b><br><b><span style='font-size:24px;'>点击查看详情</span></b>"
      }],

      creditsPosition: "top-right" // 默认是在左上角
    }); // end AmChart.MakeChart
  };

  onFailure = function () {
    alert('暂时无法获取数据。请稍后再试。会向机房老师反应。');
  };

    // 请求数据并将图标显示在页面
  return (function () {
    var tryTimes,
      highestScore;

    $.get('/resultsController/loginUser')
      .done(function (d) {
        tryTimes = d.length;
        highestScore = _.reduce(d, function (a, e) {
          return (a > e.value ? a : e.value);
        });
      })
      .done(function (d) {
        drawChart(d);
      })
      .done(function () {

        $("#chart_info").text("一共考了" + tryTimes + "次。最佳成绩是" + highestScore + "。");
      })
      .fail(onFailure);

  }());
}; // end ydMakeChart
