+function() {
  setTimeout(function() {
    $.ajax = function(options) {
      var dfd = $.Deferred()
        , data = {}
        , url = options.url
        , params = options.data
        , code = 0
        , message;
      
      if(url.indexOf('/getLottery') > -1) {
        message = 'success';
        code = 0;
        data = {
          status:2,  //1:有剩余抽奖机会 2:未完成游戏无剩余抽奖机会 3：机会超限
          prize:'10彩贝',
          gameNumber:10,
          number:1
        };
      }

      console.log('$.ajax', url, options, {code: code, message: message, data:data});
      setTimeout(function() {
        dfd.resolve({code: code, message: message, data:data});
      }, 0);
      return dfd;
    };
  });
}();


