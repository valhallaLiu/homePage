require.config({
	paths:{
		jquery:"libs/jquery-1.11.3.min",
		getPosition:"component/getPosition",
		lightbox:"component/lightBox",
		deviceType:"component/deviceType"
	}
});
require(["jquery","getPosition","lightbox","deviceType"],function($,getPosition,lightBox,deviceType){
	//如果缩略图下载完毕，则可以插入图片
	var canAppendPic = false;
	//获取不同相册的图片
	var picType = "landscape";
	function choosePicType(){
		$(".nav-list").each(function(){
			this.addEventListener("click",function(){
				picType = $(this).attr("data-type");
				$(".nav-list").removeClass("active");
				$(this).addClass("active");
				render();
			})
		})
	}
	//获取图片数据并渲染至页面
	function render(){
		$.ajax({
			type:"get",
			url:"../data/albumThumbnail.json",
			async:true,
			success:function(json){
				$(function(){
					//获取外部容器的宽度
					var width = $(".photo-grird").width();
					//获取缩略图的宽高
					var data = getSize(json[picType],"tWidth","tHeight");
					//每300ms检查一次，是否图片加载完毕
					var timer = null;
					timer = setInterval(function(){
						if(canAppendPic){
							$(".photo-container").removeClass("container-loading");
							appendPic($(".photo-grird"),data,width,5);
							clearInterval(timer);
						}
					},300);
					//窗口变化时重新计算
					$(window).resize(function(){
						var width = $(".photo-grird").width();
						appendPic($(".photo-grird"),data,width,5);
					})		
				})
			}
		})
	}
	//获取图片的宽高,参数：data-图片的位置，width-宽度命名字符串，height-高度命名字符串，返回值：带有图片位置的json数据
	function getSize(data,width,height){
		var num = data.length;
		$(data).each(function(){
			var _this_ = this,
				img_url = this.thumbnailPath,
				img = new Image();
			img.src = img_url;
			//获取图片宽高，如果图片已缓存，就从缓存里读取
			if(img.complete){
				_this_[width] = img.width;
				_this_[height] = img.height;
				num--;
				if(num == 0){
					canAppendPic = true;
				}

			}else{
				img.onload = function(){
					_this_[width] = img.width;
					_this_[height] = img.height;
					num--;
					if(num == 0){
						canAppendPic = true;
					}
				}
			}
		});
		return data;
	}
	//将图片元素插入容器中,参数： container-容器的jq对象、data-图片数组、width-容器宽度、gap-图像之间的间距
	function appendPic(container,data,width,gap){
		//获取图片的位置
		var arr = getPosition(data,width,gap);
		var html = "";
		//拼接目标字符串
		for(var i=0;i<data.length;i++){
			var src = data[i].thumbnailPath;
			var largePicSrc = data[i].path;
			var group = data[i].group;
			var id = data[i].id;
			var width = arr[i].width;
			var height = arr[i].height;
			var top = arr[i].top;
			var left = arr[i].left;
			html +='<div class="photo-thumbnail"  style="width: '+width+'px; height: '+height+'px; top: '+top+'px; left: '+left+'px;">'+
				'<a href="javascript:;">'+
					'<img src="' +src+ '" class="js-lightbox" data-src="'+largePicSrc+'" data-group="'+group+'" data-id="'+id+'" data-caption = "this is 1-1"  />'+
				'</a>'+
			'</div>'
		}
		//将拼接的字符串填充到容器中
		container.html(html);
		//将容器的高度设置为所有图片的高度
		container.height(arr[arr.length-1].top + arr[arr.length-1].height);
	}
	
	$(function(){
		//绑定点击事件
		choosePicType();
		//渲染画面
		render();
		//lightbox插件
		if(deviceType.isMobile){
			var lb = new lightBox({
				speed:"slow",
				scale:1.1
			})
		}else{
			var lb = new lightBox({
				speed:"slow",
				scale:0.8
			})
		}
		
	})
})
