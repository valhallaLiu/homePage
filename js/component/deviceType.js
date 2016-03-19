define(function(){
	//手机端和pad端的判断
	var ua = navigator.userAgent;
	var ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
    isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
    isAndroid = ua.match(/(Android)\s+([\d.]+)/),
    isMobile = isIphone || isAndroid;
  	var deviceType ={
  		"isIphone":isIphone,
  		"isAndroid":isAndroid,
  		"isMobile":isMobile
  	};
  	return deviceType;
})