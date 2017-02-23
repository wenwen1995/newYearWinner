# newYearWinner
移动端新年刮刮乐活动

最终页面如下：
![](http://p1.bqimg.com/567571/f68a5958fdc173ca.png)

刮奖的时候是这样的：
![](http://p1.bqimg.com/567571/a7d2b404704abdf8.png)

这其中还是遇到挺多的坑的，以至于当时都觉得做不出来，后来请教了同事，一起解决了。感谢感谢。

这里实现刮奖效果用到了插件scratchCard.js

具体实现刮刮乐是这样的实现的：
html代码：

    <!-- 顶部引入css -->
    <link rel="stylesheet" type="text/css" href="../c/reset.css">
    <link rel="stylesheet" type="text/css" href="../c/index.css">

    <!-- 刮卡设置 -->
        <div class="lottery" >
            <div class="gamecon">
                <!-- 开始刮奖信息 -->
                <p class="start">每日刮一刮，新年好运气</p>
                <!-- 今日已抽完 -->
                <p class="info enough">啊哦，今日机会已用完，明天再战！</p>
                <!-- 没有抽奖机会 -->
                <div class="noChance line1">您还没有抽奖机会哦！</div>
                <div class="noChance">赶紧去赢几圈吧</div>
                <!-- 中奖文字 -->
                <div class="allPrize">
                    <div class="prizeText prize0">
                      <p>哇噢！实在太赞了！</p>
                      <p>又赚了<span class="prize"></span>！</p>
                    </div>
                    <div class="prizeText prize1">
                      <p>哦哟！手气真旺！</p>
                      <p>成功收集<span class="prize"></span>！</p>
                    </div>
                    <div class="prizeText prize2">
                      <p>这位大侠实在是高！</p>
                      <p><span class="prize"></span>双手奉上！</p>
                    </div>
                    <div class="prizeText prize3">
                      <p>牌打得真好，在下认输了！</p>
                      <p><span class="prize"></span>已飞至您账户！</p>
                    </div>
                </div>

                <!-- 刮刮卡区域 -->
                <canvas id="lotteryCard">对不起，你的浏览器不支持canvas</canvas> 
                <div class="cardBg" id="lotteryBg"></div>

            </div>
       <!-- 刮卡结束 -->


      <script>
	    // 领奖
	    var oConfig = {
	      oData:{
	        status:1,  //1:有剩余抽奖机会 2:未完成游戏无剩余抽奖机会 3：机会超限
	        prize:'10彩贝',
	        gameNumber:10,
	        number:1
	      }
	    };
	    //ajax地址
	    window.oPageConfig = { 
	      oUrl:{
	        getLottery:'/getLottery'  
	      }
	    }
	  </script>

    <!-- 引入的插件 -->
  	<script src="../j/lib/jquery-3.1.1.min.js"></script>
    <script src="../j/lib/scratchCard.js"></script>

    <!-- 测试文件start -->
    <script src="../j/test/index.js"></script>
    <!-- 测试文件end -->

    <!-- 移动端页面适配文件 -->
    <script src="../j/ViewAdaptor.js"></script>
    <!-- 功能文件 -->
  	<script src="../j/index.js"></script>


对应的css样式：
   
     #lotteryCard{
	    height: 1.55rem;
	    width: 4.3rem;
	    position: absolute;
	    top: 0.08rem;
	    z-index: 5;
    }
    .cardBg{
	  width: 4.3rem;
	  height: 1.11rem;
	  background: url(../i/scratchBox.png) 0 0 no-repeat;
	  background-size: cover;
	}
	.cardFace{
	  width: 4.3rem;
	  height: 1.11rem;
	  background: url(../i/cardFace.png) 0 0 no-repeat;
	  background-size: cover;
	}
	.scratchBox{
	  width: 4.3rem;
	  height: 1.11rem;
	  background: url(../i/scratchBox.png) 0 0 no-repeat;
	  background-size: cover;
	  display: none;
	}
	.cardBg{
	  position: relative;
	  z-index: 4;
	}

此为scratchBox.png

![](http://p1.bqimg.com/567571/a9ba3f67cfb0b5e6.png)

此为cardFace.png

![](http://p1.bqimg.com/567571/13c0baa91a297b98.png)

 **id为lotteryCard的z-index应该大于cardBg的z-index,页面刚开始显scratchBox的图片，在开始刮奖的时候，插件会绘制出灰色的canvas矩形图，因为z-index高，会覆盖在最上面，然后在设置插件大概在涂抹了百分之多少后露出全部，此时把类名为cardBg的改变为cardFace**


对应的index.js这样:

    /*
	index.js
	by renwenji 
	2016/12/23
	功能：实现抽奖 */
  

    $(function(){
	var ui = {
 	  	$number: $('.number') //剩余抽奖次数
      , $gameNumber: $('.gameNumber') //剩余游戏局数
      , $remain: $('.remain')
      , $enough: $('.enough') //今日抽奖机会已完信息
      , $noChance: $('.noChance') //没有抽奖机会信息
      , $allPrize: $('.allPrize') //中奖信息大的div
      , $goGame: $('.goGame') //马上游戏
      , $prize: $('.prize') //xx彩贝
      , $lotteryBg: $('#lotteryBg') //刮奖背景图
      , $lotteryCard: $('#lotteryCard') //canvas画布
      , $scratchBox: $('.scratchBox') //无文字的背景
      , $start:$('.start')

	};
	
	var oPageConfig = window.oPageConfig;
	var status = oConfig.oData.status;
	console.log(status)
	var prize = oConfig.oData.prize;
	var number = oConfig.oData.number; //获取后端传过来的剩余抽奖次数
	console.log(number)
	var gameNumber = oConfig.oData.gameNumber;
	var numid = oConfig.oData.numid;
	var channelid = oConfig.oData.channelid;
	var flag = true;
	
	ui.$number.text(number);
	ui.$gameNumber.text(gameNumber);
	ui.$prize.text(prize)

    var oPage = {
	//init初始化程序
	init:function(){
      this.status(); //页面状态
      this.fcanvas();
      this.listen();
	}
    , status:function(){
    switch (status) {
     case 2: //未完成游戏没有剩余抽奖机会
        ui.$start.hide();
        ui.$noChance.show();
        break;
     case 3: //今日抽奖机会已完提示
        ui.$start.hide();
        ui.$enough.show();
       break;
     default:
         break;
      }
    }
    , fcanvas: function(){      //刮刮卡
	    if(number > 0){
	      var root = parseInt($('html').css('fontSize'));
	            var self = this;
	            var offset = $('#lotteryCard').offset();
	            self.scratchCard = new ScratchCard({
	                 canvas: document.getElementById('lotteryCard')
	              , w: 4.3*root
	              , h: 1.11*root
	              , bgColor: '#cdcdcd'
	              , canvasOffsetLeft: offset.left
	              , canvasOffsetTop: offset.top
	              , r: 0
	              , percentage: 50  //设置刮开>=50%后就显示底部的全部
	              , font: '每日刮一刮，新年好运气'  //can
	            , tipCallBack: function() {
                    //刮完奖后执行回调函数（显示底部的白色图片，最开始的"每日刮一刮，新年好运气"文字隐藏）
	                 ui.$lotteryBg.removeClass('cardBg').addClass('cardFace');
	                 ui.$start.hide();
	              }
	            })
	      }
    }
    , listen:function(){
      //刮奖触发奖励函数flottery
        ui.$lotteryCard.on('touchstart',function(){
           oPage.flottery();
        });
    }
    , flottery:function(){
        var self = this;
            if(flag && number > 0){
                flag = false;
                    $.ajax({
                        url:oPageConfig.oUrl.getLottery,
                        type:'post',
                        data:{},
                        dataType:'JSON'
                      }).done(function(msg){
                            // console.log(msg.data)
                        if(msg.code == 0){  //成功
                             number--;
                             console.log(number)
                             // msg.data.number = number;
                             // number = msg.data.number;
                             ui.$number.text(number);
                            //随机的奖励出现
                            var randomIndex = Math.floor(Math.random()*4); //随机产生中奖序号
                             ui.$allPrize.find('.prize'+randomIndex).show(); //显示中奖信息
                             self.scratchCard.callback = function() {
                                ui.$prize.text(msg.data.prize);
                                status = msg.data.status;
                                //2s后将中奖信息隐藏，并且恢复成原来刮奖的样子
                                setTimeout(function(){
                                   self.scratchCard.drawMask();
                                   ui.$allPrize.find('.prize'+randomIndex).hide();
                                   ui.$lotteryBg.removeClass('cardFace').addClass('cardBg');
                                },2000);

                              }
                            if(number == 0 && msg.data.status == 3){
                                ui.$number.text(0);
                                self.scratchCard.callback = function() {
                                //2s后显示今日抽奖次数已完提示，恢复成原来刮奖样子
                                 setTimeout(function(){
                                  ui.$lotteryBg.removeClass('cardFace').addClass('cardBg');
                                    ui.$allPrize.find('.prize'+randomIndex).hide();
                                    ui.$enough.show();
                                    ui.$start.hide();
                                 },2000);
                               }
                             }else if(number == 0 && msg.data.status == 2){
                               self.scratchCard.callback = function() {
                             //2s后显示没有多余的抽奖次数，提示多玩几把，并恢复成原来刮奖样子
                                 setTimeout(function(){
                                  ui.$lotteryBg.removeClass('cardFace').addClass('cardBg');
                                    ui.$allPrize.find('.prize'+randomIndex).hide();
                                    ui.$noChance.show();
                                    ui.$start.hide();
                                 },2000);
                               }
                             }
                         }
                       //避免多次快速点击，执行多次ajax
                       setTimeout(function(){
                           flag = true;
                       },1000);
                    });
               }else{
                ui.$number.text(0);
            }
        }
	};
	oPage.init();
	});





   



