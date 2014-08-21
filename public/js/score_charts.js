AmCharts.ready(function () {
        generateChartData();
        createStockChart();
      });

      var chartData = [];

      function generateChartData() {
        var firstDate = new Date(2014, 10, 1);
        firstDate.setDate(firstDate.getDate() - 500);
        firstDate.setHours(0, 0, 0, 0);

        for (var i = 0; i < 10; i++) {
          var newDate = new Date(firstDate);
          newDate.setDate(newDate.getDate() + i * 10);

          var value = Math.round(Math.random() * (100 + i)) + 100 + i;

          var level = _.sample(['3a', '3b', '3c', '4a', '4b', '4c', '5a', '5b', '5c']);

          var url = _.sample(['/user.html', '/start.html', 'examid/2.html', 'exmaid/3.html', 'examid/4']);

          chartData.push({
            date: newDate,
            value: value,
            level: level,
            url: url
          });
        }
      }


      function createStockChart() {
        var chart = new AmCharts.AmStockChart();
        chart.pathToImages = "../amcharts/images/";

        // DATASETS //////////////////////////////////////////
        var dataSet = new AmCharts.DataSet();
        dataSet.color = "#b0de09";
        dataSet.fieldMappings = [{
          fromField: "value",
          toField: "value"
        }, {
          fromField: "level",
          toField: "level"
        }, {
          fromField: "url",
          toField: "url"
        }];
        dataSet.dataProvider = chartData;
        dataSet.categoryField = "date";

        chart.dataSets = [dataSet];

        // PANELS ///////////////////////////////////////////
        var stockPanel = new AmCharts.StockPanel();
        stockPanel.showCategoryAxis = true;
        stockPanel.title = "成绩";
        stockPanel.eraseAll = false;
        stockPanel.addLabel(0, 100, "好好学习，天天向上中 :) ", "center", 26);

        // 参考 stockAddRemovePanel.html 例子
        // 参考 http://docs.amcharts.com/3/javascriptcharts/AmGraph
        var graph = new AmCharts.StockGraph();
        graph.valueField = "value";
        graph.levelField = "level";
        graph.urlField = "url";  //urlField这个属性名是内置属性
        graph.bullet = "round";
        graph.bulletColor = "#FFFFFF";
        graph.bulletBorderColor = "#00BBCC";
        graph.bulletBorderAlpha = 1;
        graph.bulletBorderThickness = 2;
        graph.bulletSize = 17;
        graph.lineThickness = 2;
        graph.lineColor = "#00BBCC";
        graph.balloonText = "score:<b>[[value]]</b><br>level:<b>[[level]]</b><br>点击查看详细报告<br>";
        graph.useDataSetColors = false;
        stockPanel.addStockGraph(graph);

        var stockLegend = new AmCharts.StockLegend();
        stockLegend.valueTextRegular = " ";
        stockLegend.markerType = "none";
        stockPanel.stockLegend = stockLegend;
        stockPanel.drawingIconsEnabled = true;

        chart.panels = [stockPanel];


        // OTHER SETTINGS ////////////////////////////////////
        var scrollbarSettings = new AmCharts.ChartScrollbarSettings();
        scrollbarSettings.graph = graph;
        chart.chartScrollbarSettings = scrollbarSettings;

        var cursorSettings = new AmCharts.ChartCursorSettings();
        cursorSettings.valueBalloonsEnabled = true;
        chart.chartCursorSettings = cursorSettings;

        var panelsSettings = new AmCharts.PanelsSettings();
        panelsSettings.creditsPosition = "bottom-right";
        chart.panelsSettings = panelsSettings;


        // PERIOD SELECTOR ///////////////////////////////////
      //  var periodSelector = new AmCharts.PeriodSelector();
      //  periodSelector.position = "bottom";
      //  periodSelector.periods = [{
      //    period: "DD",
      //    count: 10,
      //    label: "10 days"
      //  }, {
      //    period: "MM",
      //    count: 1,
      //    label: "1 month"
      //  }, {
      //    period: "YYYY",
      //    count: 1,
      //    label: "1 year"
      //  }, {
      //    period: "YTD",
      //    label: "YTD"
      //  }, {
      //    period: "MAX",
      //    label: "MAX"
      //  }];
      //  chart.periodSelector = periodSelector;

        chart.write('chartdiv');
      };
