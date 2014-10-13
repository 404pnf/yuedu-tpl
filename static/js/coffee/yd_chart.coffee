# ## 使用的库是amchart
# http://www.amcharts.com/

root = global ? window

root.ydMakeChart = ->
  drawChart = (data) ->
    # AmCharts.makeChart 接受的参数是页面上的 cssID。
    # 生成的图标将会直接插入到这个cssID所在的div中。
    AmCharts.makeChart "chartdiv",
      {
        type: "serial"
        theme: "light"
        dataProvider: data
        categoryField: "date"
        startDuration: 1
        rotate: false # 是否x轴和y轴互换
        categoryAxis: {}

        graphs: [
          {
            type: "column"
            columnWidth: 0.3 # 设定column的宽度 区间是 0 .. 1 相对宽度
            title: ""
            valueField: "value"
            urlField: "url"
            fillAlphas: 1
            balloonText: "[[date]]<br>
              <b><span style='font-size: 24px;'>[[value]]</span></b><br>
              <b><span style='font-size: 24px;'>点击查看详情</span></b>"
          }
          {
            type: "line"
            title: ""
            valueField: "value"
            urlField: "url"
            lineThickness: 6
            bullet: "round"
            bulletSize: 20
            balloonText: "[[date]]<br>
            <b><span style='font-size: 24px;'>[[value]]</span></b><br>
            <b><span style='font-size: 24px;'>点击查看详情</span></b>"
          }
        ]

        creditsPosition: "top-right" # 默认是在左上角
      }

  onFailure = ->
    alert "暂时无法从服务器获取数据。请稍后再试。"

  # 请求数据并将图标显示在页面。
  # 根据数据计算出参加了几次考试和最高成绩，并显示在页面上。
  do ->
    $.get("/resultsController/loginUser")
      .done (d) ->
        drawChart d
      .done (d) ->
        tryTimes = d.length
        sortedScore = _.sortBy d, (e) -> e.value
        highestScore = _.last(sortedScore).value
        $("#chart_info").text "我共参加了#{tryTimes}次测试，
          目前最佳成绩是#{highestScore}级。"
      .fail onFailure
