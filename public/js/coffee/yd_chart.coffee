root = global ? window

root.ydMakeChart = ->
  drawChart = (data) ->
    AmCharts.makeChart "chartdiv",
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
            <b><span style='font-size:24px;'>[[value]]</span></b><br>
            <b><span style='font-size:24px;'>点击查看详情</span></b>"
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
          <b><span style='font-size:24px;'>[[value]]</span></b><br>
          <b><span style='font-size:24px;'>点击查看详情</span></b>"
        }
      ]
      creditsPosition: "top-right" # 默认是在左上角

  onFailure = ->
    alert "暂时无法获取数据。请稍后再试。会向机房老师反应。"

  # 请求数据并将图标显示在页面
  (->
    $.get("/resultsController/loginUser")
      .done (d) ->
        drawChart d
      .done (d) ->
        tryTimes = d.length
        sortedScore = _.sortBy d, (e) -> e.value
        highestScore = _.last(sortedScore).value
        $("#chart_info").text "我共参加了#{tryTimes}次测试。
          目前最佳成绩是#{highestScore}级。"
      .fail onFailure
  )()
