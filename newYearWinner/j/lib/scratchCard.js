/*
  1.该插件，适用于手机端，pc端（IE不支持）。
  2.颜色传入形式必须是：#333，或者#445566，不能传入单词（例如red）
  3.调用方式
  var scratchCard = new ScratchCard(options);
  var options = {
      x: 0 //目标对象相对于画布的起始位置 
    , y: 0
    , w: 80 //目标对象宽高
    , h: 80
    , r: 0 //目标对象半径
    , bgColor: '#666' //目标对象背景色
    , percentage: 30 // 百分比:清除面积达到一定时，会显示中奖情况
    , lineWidth: 30 / 清除时线条宽度
    , callback 刮开后的回调函数
  };
*/
(function(g) {
  function ScratchCard(options) {
    // 目标对象---初始参数
    var defaultOptions = {
        x: 0 
      , y: 0
      , w: 80
      , h: 80
      , r: 0
      , canvasOffsetTop: 0
      , canvasOffsetLeft: 0
      , bgColor: '#666'
      , percentage: 50
      , lineWidth: 30
      , font: ''
      , fontType: 'bold 40px sans-serif' 
      , fontLocation: 'center'
      , fontColor: '#6B6B6B'
      , callback: function() {return true;}
      , firstTip: true 
      , tipCallBack: function() {return true;}
    };
    options = extend(defaultOptions, options);
    this.canvas = options.canvas; // 画布DOM对象
    this.ctx = this.canvas.getContext('2d');
    this.canvasX = options.x; //目标对象相对于画布的起始位置 
    this.canvasOffsetTop = options.canvasOffsetTop;// 目标对象相对于文档
    this.canvasOffsetLeft = options.canvasOffsetLeft;
    this.canvasY = options.y;
    this.canvasH = options.h; //目标对象宽高
    this.canvasW = options.w;
    this.canvasR = options.r; //目标对象半径
    this.canvasC = options.bgColor; //目标对象背景色
    this.canvasFontC = options.fontColor; //文字颜色
    this.percentage = options.percentage // 百分比:清除面积达到一定时，会显示中奖情况
    this.lineWidth = 30; // 清除时线条宽度
    this.radius = this.lineWidth / 2;
    this.isDown = false; // 确定是否正在刮卡
    this.startX = 0; // 刮卡起始位置(相对于文档)
    this.startY = 0;
    this.num = 0; //刮卡次数
    this.clearArea = 0;
    this.font = options.font;
    this.fontType = options.fontType;
    this.fontLocation = options.fontLocation;
    this.fontColor = options.fontColor;
    this.callback = options.callback;
    this.firstTip = options.firstTip;
    this.tipCallBack = options.tipCallBack;
    this.init();
  };
  ScratchCard.prototype = {
    constructor: ScratchCard,
    init: function() {
      if(this.canvas.getContext) {
        this.drawMask();
        this.eventName();
        this.bindEvent();
      } else{
        alert('对不起，你手机不支持canvas!');
      }
    },
    bindEvent: function() {
      // 鼠标按下
      onEvent(this.canvas, this.downEvent, this.startMove, this);
    },
    // 初始化刮刮卡
    drawMask: function() {
      var self = this;
      this.canvas.style.display = 'block';
      this.canvas.style.opacity = 1;
    },
    // 清除
    clearMask: function(x1, y1, x2, y2) {
      this.ctx.save();//存储
      this.ctx.globalCompositeOperation = 'destination-out';//画笔与背景重叠部分变透明。
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.strokeStyle = "#fff";
      this.ctx.beginPath();
      this.ctx.lineCap = "round";//起点与终点成圆角
      this.ctx.lineJoin = "round";//交叉区圆角处理
      this.ctx.moveTo(x1,y1);
      this.ctx.lineTo(x2,y2);
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.restore();//恢复
    },
    // 鼠标按下事件
    startMove: function(e) {
      var self = this;

      e.preventDefault();
      if(this.firstTip) {
        this.firstTip = false;
        this.tipCallBack();
        self.ctx.save();
        self.ctx.clearRect(0, 0, this.canvasW, this.canvasH);
        self.ctx.fillStyle = self.canvasC;
        self.ctx.fillRect(0, 0, self.canvasW, self.canvasH);
        self.ctx.restore();
      }

      this.startX  = e.targetTouches ? e.targetTouches[0].pageX : e.pageX;
      this.startY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY;
      // 判断是否在刮刮卡区域
      if(
        this.startX < this.canvasOffsetLeft
        || this.startY < this.canvasOffsetTop
        || this.startX > (this.canvasOffsetLeft + this.canvasW)
        || this.startY > (this.canvasOffsetTop + this.canvasH)
      ) {
        return;
      }
      this.isDown = true;
      this.num++;

      // 鼠标移动
      onEvent(this.canvas, this.movingEvent,  this.moveing, this);
      // 松开鼠标
      onEvent(window, this.upEvent, this.endMove, this);
    },
    // 鼠标移动事件
    moveing: function(e) {
      e.preventDefault();
      // 检测到绘画
      if(this.isDown){
        var mouseX = e.targetTouches ? e.targetTouches[0].pageX : e.pageX,
            mouseY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY;
        if(!(mouseX == this.startX && mouseY == this.startY)) {
          // 刮开涂层的效果实现
          this.clearMask(this.startX - this.canvasOffsetLeft, this.startY - this.canvasOffsetTop, mouseX - this.canvasOffsetLeft, mouseY - this.canvasOffsetTop);
          //结束点就是下一次绘画的起点
          this.startX = mouseX;
          this.startY = mouseY;
        }
      }
    },
    // 鼠标松开事件
    endMove: function(e) {
      if(e.target.getAttribute('id') != this.canvas.getAttribute('id')) {
        return false;
      }
      e.preventDefault();
      this.isDown = false;
      offEvent(this.canvas, this.movingEvent, this.moveing);
      offEvent(window, this.upEvent, this.endMove, this);
      if(this.gameOver()) {
        this.firstTip = true;
        this.ctx.clearRect(0, 0, this.canvasW, this.canvasH);
        this.fadeOut(this.canvas);
        this.callback();
      }
    },
    // 刮卡结束(清除一定面积后，刮卡结束)
    gameOver: function() {
      var imgData = this.ctx.getImageData(this.canvasX, this.canvasY, this.canvasW, this.canvasH),
          pix = imgData.data,
          RGB = colorRgb(this.canvasC),
          totalArea = this.canvasH * this.canvasW,
          unClearArea = 0;
      for(var i = 0, l = pix.length; i < l; i += 4) {
        if (pix[i] === RGB.R && pix[i + 1] === RGB.G && pix[i + 2] === RGB.B) {
          unClearArea ++;
        }
      }
      if((1 - this.percentage / 100) >= unClearArea / totalArea) {
        return true;
      } else{
        return false;
      }
      return true;
    },
    // 淡出
    fadeOut: function(elem, speed, opacity) {
      var self = this;
      /*
      参数说明:
        elem==>需要淡入的元素
        speed==>淡入速度,正整数(可选)
        opacity==>淡入到指定的透明度,0~100(可选)
     */
      speed = speed || 20;
      opacity = opacity || 0;
      // 初始化透明度变化值为100
      var val = 100;
      // 循环将透明值以5递减,即淡出效果
      (function(){
          self.SetOpacity(elem, val);
          val -= 5;
          if (val >= opacity){
            setTimeout(arguments.callee, speed);
          } else if (val < 0){
            //元素透明度为0后隐藏元素
            elem.style.display = 'none';
          }
      })();
    },
    // 设置透明度
    SetOpacity: function(ev, v){
      //设置元素透明度,透明度值按IE规则计,即0~100
      ev.filters ? ev.style.filter = 'alpha(opacity=' + v + ')' : ev.style.opacity = v / 100;
    },
    // 设备事件
    eventName: function() {
      var flag = isPC();
      this.downEvent = flag ? 'mousedown' : 'touchstart';
      this.movingEvent = flag ? 'mousemove' : 'touchmove';
      this.upEvent = flag ? 'mouseup' : 'touchend';
    }
  };
  // 合并对象
  function extend(o,n,override){
    // override: false 浅合并
    //          true  深合并
    override = (override == undefined) ? true : override;
    for(var p in n) {
      if(n.hasOwnProperty(p) && override){
        o[p] = n[p];
      }
    }
    return o;
  }
  // 绑定事件
  function onEvent(obj, eventName, eventFunction, param) {
    var fun = eventFunction;
    //继承监听函数,并传入参数以初始化;
    if(param) {
      fun = function(e) {
        eventFunction.call(param, e);  
      }
    }
    if(document.addEventListener){  
      obj.addEventListener(eventName, fun, false);  
    }
  }
  // 卸载事件
  function offEvent(obj, eventName, eventFunction) {
    if(document.removeEventListener){  
      obj.removeEventListener(eventName, eventFunction, false);  
    }
  }
  // 判断pc or mobile
  function isPC() {
   var userAgentInfo = navigator.userAgent,
       Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"), 
       flag = true,
       len = Agents.length;  
   for(var v = 0; v < len; v++) {  
      if(userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }  
   }  
   return flag;  
  }
  // 颜色转换(16进制转rgb)
  function colorRgb(sColor) {
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/; 
    sColor = sColor.toLowerCase();  
    if(sColor && reg.test(sColor)) {  
      if(sColor.length === 4){  
        var sColorNew = "#";  
        for(var i = 1; i < 4; i += 1){  
          sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));     
        }  
        sColor = sColorNew;  
      }  
      //处理六位的颜色值  
      var sColorChange = [];  
      for(var i = 1; i < 7; i += 2){  
        sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));    
      }  
      return {
        R: sColorChange[0],
        G: sColorChange[1],
        B: sColorChange[2]
      }
    } else{  
      return sColor;    
    } 
  }
  g.ScratchCard = ScratchCard;
})(window);