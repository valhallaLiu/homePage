require.config({
	paths:{
		jquery:"libs/jquery-1.11.3.min",
		getPosition:"component/getPosition"
	}
});
require(["jquery","getPosition"],function($,getPosition){
	//获取图片数据并渲染至页面
	$.ajax({
		type:"get",
		url:"../data/albumThumbnail.json",
		async:true,
		success:function(json){
			$(function(){
				//初始化图片的位置
				var width = $(".photo-grird").width();
				appecndPic($(".photo-grird"),json.portrait,width,5);
				//窗口变化时重新计算
				$(window).resize(function(){
					var width = $(".photo-grird").width();
					appecndPic($(".photo-grird"),json.portrait,width,5);
				})		
			})
		}
	})
	//将图片元素插入容器中,参数： container-容器的jq对象、data-图片数组、width-容器宽度、gap-图像之间的间距
	function appecndPic(container,data,width,gap){
		//获取图片的位置
		var arr = getPosition(data,width,gap);
		var html = "";
		//拼接目标字符串
		for(var i=0;i<data.length;i++){
			var src = data[i].thumbnailPath;
			var width = arr[i].width;
			var height = arr[i].height;
			var top = arr[i].top;javascript:;
			var left = arr[i].left;
			html +='<div class="photo-thumbnail"  style="width: '+width+'px; height: '+height+'px; top: '+top+'px; left: '+left+'px;">'+
				'<a href="javascript:;">'+
					'<img src="' +src+ '" />'+
				'</a>'+
			'</div>'
		}
		//将拼接的字符串填充到容器中
		container.html(html);
		//将容器的高度设置为所有图片的高度
		container.height(arr[arr.length-1].top + arr[arr.length-1].height);
	}
})
