//模块用于返回一组图片的位置，传入的参数为：data-需获取参数的数组、width-容器元素的宽度、gap-图片左右及上下的间距
require.config({
	paths:{
		jquery:"libs/jquery-1.11.3.min",
		deviceType:"component/deviceType"
	}
});
define(["jquery","deviceType"],function($,deviceType){
	//手机端和pad端的判断
/*	console.log(deviceType);
	var ua = navigator.userAgent;
	var ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
    isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
    isAndroid = ua.match(/(Android)\s+([\d.]+)/),
    isMobile = isIphone || isAndroid;*/
    //获取图片位置方法
	function getPicPos(data,width,gap){
		//初始化合计宽度为0、宽高百分比为0
		var sumWidth = 0;
		var sumTop = 0;
		var percent = 0;
		//初始化数组用来存放图片信息
		var aImgInfo = [];
		//每行图片的断开序号
		var indexPoint = 0;
		$(data).each(function(index){
			var imgInfo = {};
			//如果是手机，则所有图片的宽高都除2
			if(deviceType.isMobile){
				imgInfo = {
					width:this.tWidth/2,
					height:this.tHeight/2,
					left:0,
					top:0
				};
			}else{
				imgInfo = {
					width:this.tWidth,
					height:this.tHeight,
					left:0,
					top:0
				};
			}
			//将初始化的信息放入数组
			aImgInfo.push(imgInfo);
			//计算图片的原始宽度和
			sumWidth += (imgInfo.width+gap);
			//如果宽度和大于容器的宽度，则说明这些图片为一行，此时调整图片宽高，让这些图片宽度之和等于容器宽度
			if(sumWidth >= width){
				//计算本行缩放比例
				percent = parseFloat(width/sumWidth);
				//添加元素信息
				for(var i=indexPoint;i<=index;i++){
					aImgInfo[i].width =  parseInt(aImgInfo[i].width*percent);
					aImgInfo[i].height = parseInt(aImgInfo[i].height*percent);
					aImgInfo[i].top = sumTop;
					//每行第一个left为10
					if(i == indexPoint){
						aImgInfo[i].left = gap;
					//剩下的为前面图片的width相加，并加上10的间距
					}else{
						aImgInfo[i].left = gap;
						for(var j=indexPoint;j<i;j++){
							aImgInfo[i].left += aImgInfo[j].width + gap;
						}
					}
				}
				//宽度和的值清零
				sumWidth = 0;
				//此时总top添加上一行高度,并添加纵向间距
				sumTop += (aImgInfo[index].height +gap);
				indexPoint = index+1;
			}
			//处理最后一行，如果index的值等于data的长度减一，则处理最后一行
			if(index == (data.length-1)){
				for(var k=indexPoint;k<=index;k++){
					aImgInfo[k].top = sumTop;
					if(k == indexPoint ){
						aImgInfo[k].left = gap;
					}else{
						aImgInfo[k].left = gap;
						for(var l=indexPoint;l<k;l++){
							aImgInfo[k].left += aImgInfo[l].width + gap;
						}
					}
				}
			}
		});
		return aImgInfo;
	}
	return getPicPos;
})
