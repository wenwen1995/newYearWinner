/*
	index.js
	by renwenji 
	2016/12/23
	功能：实现抽奖
 */
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
              , font: '每日刮一刮，新年好运气'
            , tipCallBack: function() {
                 ui.$lotteryBg.removeClass('cardBg').addClass('cardFace');
                 ui.$start.hide();
              }
            })
      }
    }
    , listen:function(){
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
                                //显示中奖信息
                                setTimeout(function(){
                                   self.scratchCard.drawMask();
                                   ui.$allPrize.find('.prize'+randomIndex).hide(); //显示中奖信息
                                   ui.$lotteryBg.removeClass('cardFace').addClass('cardBg');
                                },2000);

                              }
                            if(number == 0 && msg.data.status == 3){
                                ui.$number.text(0);
                                self.scratchCard.callback = function() {
                                 setTimeout(function(){
                                  ui.$lotteryBg.removeClass('cardFace').addClass('cardBg');
                                    ui.$allPrize.find('.prize'+randomIndex).hide();
                                    ui.$enough.show();
                                    ui.$start.hide();
                                 },2000);
                               }
                             }else if(number == 0 && msg.data.status == 2){
                               self.scratchCard.callback = function() {
                                 setTimeout(function(){
                                  ui.$lotteryBg.removeClass('cardFace').addClass('cardBg');
                                    ui.$allPrize.find('.prize'+randomIndex).hide();
                                    ui.$noChance.show();
                                    ui.$start.hide();
                                 },2000);
                               }
                             }
                         }
                       setTimeout(function(){
                           flag = true;
                       },1000);
                    });
               }else{
                ui.$number.text(0)
               }
     }
};
oPage.init();
});


