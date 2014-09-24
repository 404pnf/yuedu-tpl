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
      sortedScore,
      highestScore;

    $.get('/resultsController/loginUser')
      .done(function (d) {
        tryTimes = d.length;
        sortedScore = _.sortBy(d, function (e) {
          return e.value;
        });
        highestScore = _.last(sortedScore).value;
      })
      .done(function (d) {
        drawChart(d);
      })
      .done(function () {

        $("#chart_info").text("我共参加了" + tryTimes +
          "次测试。目前最佳成绩是" + highestScore + "级。");
      })
      .fail(onFailure);

  }());
}; // end ydMakeChart