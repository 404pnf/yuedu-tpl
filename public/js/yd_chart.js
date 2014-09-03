// ## jslint配置 不要删除
/*jslint vars: true, browser: true , devel: true, nomen: true, indent: 2*/
/*global $, jQuery, EJS, _, AmCharts*/

var ydMakeChart = function () {
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
            title: "",
            valueField: "value",
            urlField: "url",
            fillAlphas:1,
            balloonText: "[[date]]<br><b><span style='font-size:24px;'>[[value]]</span></b><br><b><span style='font-size:24px;'>点击查看详情</span></b>"
        }, {
            type: "line",
            title: "",
            valueField: "value",
            urlField: "url",
            lineThickness: 6,
            bullet: "round",
            bulletSize: 30,
            balloonText: "[[date]]<br><b><span style='font-size:24px;'>[[value]]</span></b><br><b><span style='font-size:24px;'>点击查看详情</span></b>"
        }],

        creditsPosition:"top-right" // 默认是在左上角
      }); // end AmChart.MakeChart
    };

    onFailure = function () {
      alert('暂时无法获取数据。请稍后再试。会向机房老师反应。')
    };

    // 请求数据并将图标显示在页面
    return $.get('/resultsController/loginUser').done(function (d) { drawChart(d); }).fail(onFailure);
  }; // end ydMakeChart


// var ydMakeChart = function () {
//   'use strict';

//   var makeChart;

//   makeChart =  function (chartData) {
//     var chart;

//     AmCharts.ready((function () {
//       //console.log(jsonData);
//       // SERIAL CHART
//       chart = new AmCharts.AmSerialChart();
//       chart.dataProvider = chartData;
//       chart.categoryField = "date";

//       // AXES
//       // category
//       var categoryAxis = chart.categoryAxis;
//       categoryAxis.gridPosition = "start";
//       categoryAxis.axisColor = "#DADADA";

//       // value
//       var valueAxis = new AmCharts.ValueAxis();
//       valueAxis.dashLength = 3;
//       valueAxis.axisAlpha = 0.2;
//       chart.addValueAxis(valueAxis);

//       // GRAPHS
//       // column graph
//       var graph1 = new AmCharts.AmGraph();
//       graph1.type = "column";
//       graph1.valueField = "value";
//       graph1.lineAlpha = 0;
//       graph1.fillColors = "#ADD981";
//       graph1.fillAlphas = 0.8;
//       graph1.urlField = "url";
//       graph1.balloonText =  "[[date]]<br><b><span style='font-size:24px;'>[[value]]</span></b><br><b><span style='font-size:24px;'>点击查看详情</span></b>";
//       chart.addGraph(graph1);

//       // line graph
//       var graph2 = new AmCharts.AmGraph();
//       graph2.type = "line";
//       graph2.lineColor = "#27c5ff";
//       graph2.bulletColor = "#FFFFFF";
//       graph2.bulletBorderColor = "#27c5ff";
//       graph2.bulletBorderThickness = 2;
//       graph2.bulletBorderAlpha = 1;
//       graph2.valueField = "value";
//       graph2.lineThickness = 2;
//       graph2.bullet = "round";
//       graph2.bulletSize = 40;
//       graph2.urlField = "url";
//       graph2.fillAlphas = 0;
//       graph2.balloonText =  "[[date]]<br><b><span style='font-size:24px;'>[[value]]</span></b><br><b><span style='font-size:24px;'>点击查看详情</span></b>";
//       chart.addGraph(graph2);

//       chart.creditsPosition = "bottom-right";

//       // WRITE
//       chart.write("chartdiv");

//       // console.log(chart);
//     }())); // end AmChart.ready


//   }; // end makeChart

//   $.get('/resultsController/loginUser', function (d) { makeChart(d); });

// }; // end ydMakeChart
