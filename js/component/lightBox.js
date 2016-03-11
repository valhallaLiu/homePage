define(function(){
	//创建构造函数
	var LightBox = function(settings){
		var _this_ = this;
		//定义参数
		this.setting = {
			speed:400, //弹出速度
			scale:0.9  //弹出比例
		}
		$.extend(this.setting,settings);
		//创建遮罩和弹出框dom
		this.popupMask = $('<div id="G-lightbox-mask"></div>');
		this.popupWin = $('<div id="G-lightbox-popup">');
		//保存body
		this.bodyNode = $(document.body);
		//渲染剩余的dom，并插入到body中
		this.renderDOM();
		//获取dom内的元素
		this.picViewArea = this.popupWin.find("div.lightbox-pic-view");
		this.prevBtn = this.popupWin.find("span.lightbox-prev-btn");
		this.popupPic = this.popupWin.find("img.lightbox-image");
		this.nextBtn = this.popupWin.find("span.lightbox-next-btn");
		
		this.picCaptionArea = this.popupWin.find("div.lightbox-pic-caption");
		this.captionText = this.popupWin.find("p.ligntbox-pic-desc");
		this.currentIndex = this.popupWin.find("span.lightbox-of-index");
		
		this.closeBtn = this.popupWin.find("div.lightbox-close-btn");
		//用于存放当前图片所属的组别名称，以及组别的信息
		this.index = 0;
		this.groupName = null;
		this.groupData = []; //放置同一组数据
		//防止用户连续点击bug
		this.canClick = true;
		//判断是不是IE6
		this.isIE6 = /MSIE 6.0/gi.test(window.navigator.userAgent)
		//为页面上所有的缩略图进行事件委托
		this.bodyNode.delegate(".js-lightbox,*[data-role=light-box]","click",function(e){
			//阻止事件冒泡
			e.stopPropagation();
			//获取当前点击图片的图片组
			var currentGroupName = $(this).attr("data-group");
			//通过当前图片的图片组，获取整组的图片信息
			if(currentGroupName != _this_.groupName){
				_this_.groupName = currentGroupName;
				//获取全部图片信息，并返回给groupData
				_this_.getGroup();
			};
			//初始化弹出
			_this_.initPopup($(this));
			//弹出后就才可resize操作
			isCanresize = true;
		});
		//绑定lightbox关闭事件
		this.popupMask.click(function(){
			$(this).fadeOut();
			_this_.popupWin.fadeOut();
			//关闭后则不可resize操作
			isCanresize = false;
		});
		this.closeBtn.click(function(){
			_this_.popupWin.fadeOut();
			_this_.popupMask.fadeOut();
			isCanresize = false;
			
		});
		//绑定按钮切换图片事件
		this.nextBtn.hover(
			function(){
				if(!$(this).hasClass("disabled")){
					$(this).addClass("lightbox-next-btn-show");
				}
			},
			function(){
				$(this).removeClass("lightbox-next-btn-show");
			}
		).click(function(e){
			if(!$(this).hasClass("disabled") && _this_.canClick){
				//阻止事件冒泡
				e.stopPropagation();
				_this_.goto("next");
			}
		});
		this.prevBtn.hover(
			function(){
				if(!$(this).hasClass("disabled")){
					$(this).addClass("lightbox-prev-btn-show");
				}
			},
			function(){
				$(this).removeClass("lightbox-prev-btn-show");
			}
		).click(function(e){
			if(!$(this).hasClass("disabled") && _this_.canClick){
				//阻止事件冒泡
				e.stopPropagation();
				_this_.goto("prev");
			}
		})
		//绑定窗口图片更改事件，采用setTimeOut的方法，防止在窗口调整过程中一产生动画队列
		var timer = null;
		//定义变量isCanresize，只有在图片弹出时，才相应window变化操作
		var isCanresize = false;
		$(window).resize(function(){
			if(isCanresize){
				clearTimeout(timer);
				timer = setTimeout(function(){
					_this_.loadPicSize(_this_.groupData[_this_.index].src);
				},1000);
			}
		//绑定按键事件到整个window
		}).keyup(function(e){
			if(isCanresize){
				if(e.keyCode == 37 || e.keyCode == 38){
					_this_.prevBtn.click();
				}else if(e.keyCode == 39 || e.keyCode == 40){
					_this_.nextBtn.click();
			}
			}
			
		})
	};
	//定义构造函数的原型方法
	LightBox.prototype = {
		//渲染图片方法
		renderDOM:function(){
			var strDOM =
				'<div class="lightbox-pic-view">'+
				'<span class="lightbox-btn lightbox-prev-btn"></span>'+
				'<img class="lightbox-image"/>'+
				'<span class="lightbox-btn lightbox-next-btn"></span>'+
				'</div>'+
				'<div class="lightbox-pic-caption">'+
				'<div class="lightbox-caption-area">'+
				'<p class="ligntbox-pic-desc">图片标题</p>'+
				'<span class="lightbox-of-index">当前索引：1 of 4</span>'+
				'</div>'+
				'<div class="lightbox-close-btn"></div>'+
				'</div>';
			//插入到popupWin中
			this.popupWin.html(strDOM);
			//把遮罩和弹出框插入到body中
			this.bodyNode.append(this.popupMask);
			this.bodyNode.append(this.popupWin);
		},
		//根据当前的组名，获取全组的信息
		getGroup:function(){
			var _this_ = this;
			//根据当前的组别名称，获取页面中所有相同组别的所有对象
			var groupList = this.bodyNode.find("*[data-group ="+ this.groupName +"]");
			//清空数组数据
			this.groupData.length = 0;
			//将一组数据的信息全部放入数组groupData中
			groupList.each(function(){
				_this_.groupData.push({
					src:$(this).attr("data-src"),
					id:$(this).attr("data-id"),
					caption:$(this).attr("data-caption")
				});
			});
		},
		
		//*****初始化弹出-主体
		initPopup:function(currentObj){
			//获取当前点击图片的id和大图地址
			var _this_ = this,
				sourceSrc = currentObj.attr("data-src"),
				currentId = currentObj.attr("data-id");
			//调用显示遮罩和弹出
			this.showMaskAndPopup(sourceSrc,currentId);
		},
		//*****初始化弹出-初始化遮罩层和弹出图片
		showMaskAndPopup:function(sourceSrc,currentId){
			var _this_ = this,
				winWidth = $(window).width(),
				winHeight = $(window).height(),
				viewWidht = winWidth/2,
				viewHeight = winHeight/2
			//隐藏图片和信息区域
			this.popupPic.hide();
			this.picCaptionArea.hide();
			//显示遮罩层
			this.popupMask.fadeIn();
			//显示弹窗
			this.popupWin.fadeIn();
			//设置图片区域的宽高
			this.picViewArea.css({
				width:viewWidht,
				height:viewHeight
			});
			//设置显示区域的宽高及动画效果
			this.popupWin.css({
				width:viewWidht+10,
				height:viewHeight+10,
				marginLeft:-(viewWidht+10)/2,
				top:-(viewHeight+10)
			}).animate({
				top: viewHeight/2-10
			},_this_.setting.speed,function(){
				//加载图片并重新定义图片的宽高
				_this_.loadPicSize(sourceSrc)
			});
			//根据当前点击的元素id获取在当前组别里的索引
			this.index =  this.getIndexOf(currentId);
			var groupDataLength = this.groupData.length;
			//判断是否有下一页和上一页的按钮，如果没有，则添加class:disabled
			if(groupDataLength > 1){
				if(this.index === 0){
					this.prevBtn.addClass("disabled");
					this.nextBtn.removeClass("disabled");
				}else if(this.index === groupDataLength-1){
					this.prevBtn.removeClass("disabled");
					this.nextBtn.addClass("disabled");
				}else{
					this.prevBtn.removeClass("disabled");
					this.nextBtn.removeClass("disabled");
				}
			}else{
				this.prevBtn.addClass("disabled");
				this.nextBtn.addClass("disabled");
			}
		},
		//*****初始化弹出-获取图片在组内的索引值
		getIndexOf:function(currentId){
			var _this_ = this,
			    index = 0;
			$(this.groupData).each(function(i){
				if(this.id === currentId){
					index = i;
					return false;
				}
			})
			return index;
		},
		//*****初始化弹出-加载图片及信息
		loadPicSize:function(sourceSrc){
			_this_ = this;
			//如果图片已加载完成，则将src放入dom对象，并获取图片宽高，传给changePic
			this.preLoadImg(sourceSrc,function(){
				_this_.popupPic.attr("src",sourceSrc);
				//上一次加载图片后，_this_.popupPic有了一个行内样式的width和height,下一次如果不设置为auto，则默认从行内样式中拿取宽高,而不是从预加载的图片中拿取了
				_this_.popupPic.css({
					width:"auto",
					height:"auto"
				});
				var picWidth = _this_.popupPic.width(),
					picHight = _this_.popupPic.height();
				_this_.changePic(picWidth,picHight);
			});
		},
		//*****初始化弹出-判断图片是否加载完成
		preLoadImg:function(src,callback){
			var img =new Image();
			if(!!window.ActiveXObject){
				img.onreadystatechange = function(){
					if(this.readyState == "complete"){
						callback();
					};
				};
			}else{
				img.onload = function(){
					callback();
				};
			};
			img.src = src;
		},
		//*****初始化弹出-设定图片合适的显示宽高，显现图片，显现图片的描述文字
		changePic:function(width,height){
			//获取视口的宽高
			var _this_ = this,
				winWidth = $(window).width(),
				winHeight = $(window).height();
			//更改图片区域的宽高，保证图片不超出视口
			var minScale = Math.min(winWidth/width,winHeight/height);
			if(winWidth/width<1||winHeight/height<1){
				minScale *= this.setting.scale;
				width = width*minScale -10;
				height = height*minScale-10;
			};
			//图片切换时，先隐藏掉相关区域
			this.prevBtn.hide();
			this.nextBtn.hide();
			this.popupPic.hide();
			this.picCaptionArea.hide();
			this.picViewArea.animate({
				width:width,
				height:height
			},_this_.setting.speed);
			//更改弹出框的宽高并将图片显现出来
			this.popupWin.animate({
				width:width+10,
				height:height,
				marginLeft:-(width/2),
				top:(winHeight-height)/2
			},_this_.setting.speed,function(){
				//弹出窗完成之后，将元素再显现出来
				_this_.popupPic.css({
					width:width,
					height:height
				}).fadeIn();
				_this_.prevBtn.fadeIn();
				_this_.nextBtn.fadeIn();
				_this_.picCaptionArea.fadeIn();
				//此时加载完毕，可以点击
				_this_.canClick = true;
			});
			//将索引和和描述文字显现出来
			this.captionText.text(this.groupData[this.index].caption);
			this.currentIndex.text("当前索引："+(this.index+1)+" of "+ this.groupData.length);
			
			
		},
		//实现图片的左右切换
		goto:function(direction){
			if(direction == "next"){
				this.index++;
				if(this.index >= this.groupData.length-1){
					this.nextBtn.addClass("disabled").removeClass("lightbox-next-btn-show");
				};
				if(this.index !=0){
					this.prevBtn.removeClass("disabled");
				};
				this.canClick = false;
				this.loadPicSize(this.groupData[this.index].src);
			}else if(direction == "prev"){
				this.index--;
				if(this.index <= 0){
					this.prevBtn.addClass("disabled").removeClass("lightbox-next-btn-show");
				};
				if(this.index != this.groupData.length-1){
					this.nextBtn.removeClass("disabled");
				};
				this.canClick = false;
				this.loadPicSize(this.groupData[this.index].src);
			}
		}
	};
	//扩展方法到windows上
	window["LightBox"] = LightBox;
})


