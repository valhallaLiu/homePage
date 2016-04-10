require.config({
	shim:{
		'jquery.fn.lazyload':{
			deps:["jquery"],
			 exports: 'jQuery.fn.lazyload'
		}
	},
	paths:{
		jquery:"libs/jquery-1.11.3.min",
		deviceType:"component/deviceType",
		'jquery.fn.lazyload':"libs/jquery.lazyload",
	}
});
require(["jquery","deviceType"],function($,deviceType){
	//*******************************全局变量**********************
	//获取页面数
	var sectionCount = $("section").size();
	//初始化页数为第一页
	var index = 1;
	//点击向下按钮，更改页面
	function btnClick(){
		$(".next-button").click(function(){
			if(index<sectionCount){
				index++;
			}else{
				index = 1;
			}
			setSection();
		})
	}
	//点击菜单项，更改页面
	function menuClick(){
		$(".main-nav li").each(function(num){
			this.no = num+1;
			$(this).click(function(){
				index = this.no;
				setSection();
			})
		});
	}
	//向上或向下滚轮屏幕，更改页面
	function pageScroll(){
		//防止连续滚动导致连续翻页，每次滚动1s之后才能第二次滚动
		var canScroll = true;
		var type = "mousewheel";
		//解决firefox的兼容性问题
	 	if (type === "mousewheel" && document.mozHidden !== undefined) {
            type = "DOMMouseScroll";
            document.body.addEventListener(type,function(event){
            	event = event || window.event;
				if(canScroll){
					if(event.detail<0){
						if(index>1){
							index--;
							canScroll = false;
							setSection();
							setTimeout(function(){canScroll = true;},1000);
						}
					}else{
						if(index<sectionCount){
							index++;
							canScroll = false;
							setSection();
							setTimeout(function(){canScroll = true;},1000);
						}
					}
				}	
            })
        }else{
        	document.body.addEventListener(type,function(event){
				event = event || window.event;
				if(canScroll){
					if(event.wheelDelta>0){
						if(index>1){
							index--;
							canScroll = false;
							setSection();
							setTimeout(function(){canScroll = true;},1000);
						}
					}else{
						if(index<sectionCount){
							index++;
							canScroll = false;
							setSection();
							setTimeout(function(){canScroll = true;},1000);
						}
					}
				}
			})
       	}
	}
	//触摸滚动，更改页面
	function pageTouchScroll(){
		if(deviceType.isMobile){
			var body = document.body,
				startY  = 0,
				endY = 0,
				moveY = 0;
			//阻止iphone的橡皮筋效果
			document.addEventListener("touchmove",function stopScrolling(e){
				e.preventDefault();
			});
			body.addEventListener("touchstart",function(e){
				startY = e.changedTouches[0].clientY;
			});
			body.addEventListener("touchend",function(e){
				endY = e.changedTouches[0].clientY; 
				moveY = endY - startY;
				if((endY-startY)>=60){
					if(index > 1){
						index --;
						setSection();
					}
					
				}else if((endY-startY)<=-60){
					if(index < sectionCount){
						index ++;
						setSection();
					}
	
				}
			})
			
		}
	}
	//用于打开和关闭主页菜单的函数
	function openMenu(){
		$(".main-menu-button").click(function(){
			if($("#main-menu").hasClass("open")){
				$("#main-menu").removeClass("open");
				$(".menu").removeClass("icon-change");
			}else{
				$("#main-menu").addClass("open");
				$(".menu").addClass("icon-change");
			}
		});
	}
	//用于设定页面的函数
	function setSection(){
		//小于index的页数类全部为state2
		for(var i=1;i<index;i++){
			$("section").eq(i-1).removeClass("state0 state1").addClass("state2");
		};
		//大于index的页数类全部为state0
		for(var j=index;j<=sectionCount;j++){
			$("section").eq(j-1).removeClass("state2 state1").addClass("state0");
		};
		//等于index的页数为state1
		$("section").eq(index-1).removeClass("state0 state2").addClass("state1");
		//如果index到最后一页，则更改按钮图标
		if(index == sectionCount){
			$(".next-button>span").addClass("icon-change");
		}else{
			$(".next-button>span").removeClass("icon-change");
		}
		//每次更改index，则移出主菜单，并添加标题颜色
		$(".main-nav a").each(function(){
			$(this).removeClass("active");
		})
		$(".main-nav a").eq(index-1).addClass("active");
		$("#main-menu").removeClass("open");
		$(".menu").removeClass("icon-change");
		//处理到每个页面触发的方法
		switch(index){
			case 2:
			skillsHandler();
			break;
			case 5:
			albumHandler();
			break;
			case 6:
			gameHandler();
			break;
		}
	}
	
	//*******************************技能页**********************
	function skillsHandler(){
		//添加进度条百分比
		$(".skill-list h3").each(function(){
			var percent = $(this).attr("data-level") + "%";
			$(this).css({
				width:percent
			});
		});
		//详细信息的hover显示，如果是手机，则不执行这段绑定
		if(!deviceType.isMobile){
			$(".skill-item").each(function(){
				$(this).hover(
					function(){
						$(this).find(".skill-info").stop().fadeIn(400);
					},
					function(){
						$(this).find(".skill-info").stop().fadeOut(200);
					}
				)
			})
		}
	}
	//*******************************相册页**********************
	//背景图片延迟加载
		function lazyLoad(obj,src){
			obj.style.backgroundImage = src;
			console.log(obj);
		}
		function albumHandler(){
			var obj = document.getElementById("main4"),
				src = "url(img/bg/bg-album.jpg)";
				lazyLoad(obj,src);
		}
	//*******************************游戏页**********************
		function gameHandler(){
			var obj = document.getElementById("main5");
				src = "url(img/bg/bg-game.jpg)";
				lazyLoad(obj,src);
		}
	$(function(){
		//页面整体效果
		btnClick();
		menuClick();
		pageScroll();
		openMenu();
		pageTouchScroll();
		//技能页效果
	})
});
//页面扔可以对index的判断进行重构优化，不需要在滚动、触摸、按钮的时候，都进行一次index的数量判断