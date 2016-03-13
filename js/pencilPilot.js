require.config({
	paths:{
		jquery:"libs/jquery-1.11.3.min"
	}
});

require(["jquery"],function($){
$(function(){
	//获取canvas对象
	var canvas = $(".canvas")[0];
	var context = canvas.getContext("2d");
	//设置游戏状态
	const WELCOM = 0,
		  START = 1,
		  RUNNING = 2,
		  PAUSE = 3,
		  GAMEOVER = 4;
	var score = 0;
	var state = 0;
	//获取当前屏幕大小，从而判断canvas画布大小
	function getScreenWH(){
		var width = document.body.clientWidth,
			height = document.body.clientHeight,
			ratio = 480/852;
		if(width >= 480){
			width = 480;
			height = 852;
		}else{
			height = parseInt(width/ratio);
			width = parseInt(width);
		}
		return {width,height};
	}
	var wH = getScreenWH();
	cWidth = wH.width;
	cHeight = wH.height;
	canvas.width = cWidth;
	canvas.height = cHeight;
	/**************1.游戏欢迎阶段**************/
	//创建背景图片和标题图片
	var bg = new Image(),
		title = new Image();
	bg.src = "../img/pencilPilot/background.png";
	title.src = "../img/pencilPilot/start.png";
	var titleX = (cWidth-280)/2;
	//创建背景图片的构造函数及参数对象
	var bgConfig = {
		img:bg,
		width:cWidth,
		height:cHeight
	};
	function Sky(config){
		this.img = config.img;
		this.width = config.width;
		this.height = config.height;
		this.x1 = 0;
		this.y1 = 0;
		this.x2 = 0;
		this.y2 = -this.height;
		this.paint = function(){
			context.drawImage(this.img,this.x1,this.y1);
			context.drawImage(this.img,this.x2,this.y2);
		};
		this.move = function(){
			this.y1 ++;
			this.y2 ++;
			/*if(this.y1 >= this.height){
				this.y1 = -this.height;
			}else if(this.y2 >= this.height){
				this.y2 = -this.height;
			}*/
			switch(this.height){
				case this.y1:
					this.y1 = -this.height;
					break;
				case this.y2:
					this.y2 = -this.height;
			}
		};
	}
	
	/**************生成游戏对象实例**************/
	var sky = new Sky(bgConfig);
	/**************游戏核心控制器**************/
	setInterval(function(){
		//绘制背景图片并循环移动
		sky.paint();
		sky.move();
		switch(state){
			case WELCOM:
				context.drawImage(title,titleX,0);
				break;
			case START:
				break;
			case RUNNING:
				break;
			case PAUSE:
				break;
			case GAMEOVER:
				break;
		}
	},50)
});
})

