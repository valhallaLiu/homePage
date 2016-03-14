require.config({
	paths:{
		jquery:"libs/jquery-1.11.3.min",
		deviceType:"component/deviceType"
	}
});
require(["jquery","deviceType"],function($,deviceType){

$(function(){
	var ua = navigator.userAgent;
	var ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
    isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
    isAndroid = ua.match(/(Android)\s+([\d.]+)/),
    isMobile = isIphone || isAndroid;
	//获取canvas对象
	var canvas = $(".canvas")[0];
	var context = canvas.getContext("2d");
	//设置游戏状态
	const WELCOM = 0,
		  LAODING = 1,
		  RUNNING = 2,
		  PAUSE = 3,
		  GAMEOVER = 4;
	var score = 0;
	var state = 0;
	//获取当前屏幕大小，从而判断canvas画布大小
	function getScreenWH(){
		var width = (window.innerWidth > 0) ? window.innerWidth : screen.width,
			height = (window.innerHeight > 0) ? window.innerHeight : screen.height,
			ratio = 480/680,
			wH = {};
		if(width >= 480){
			width = 480;
			height = 680;
		}else{
			height = parseInt(width/ratio);
			width = parseInt(width);
		};
		wH = {"width":width,"height":height};
		return wH;
	};
	var wH = getScreenWH();
	cWidth = wH["width"];
	cHeight = wH["height"];
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
			switch(this.height){
				case this.y1:
					this.y1 = -this.height;
					break;
				case this.y2:
					this.y2 = -this.height;
			}
		};
	}
	/**************2.游戏载入阶段**************/
	canvas.onclick = function(){
		if(state == WELCOM){
			state = LAODING;
		}
	}
	//将loading的四张图片放入数组
	var loadingImages = [];
	for(var i=0;i<4;i++){
		loadingImages[i] = new Image();
		loadingImages[i].src = "../img/pencilPilot/game_loading"+ (i+1) +".png";
	}
	var loadingConfig = {
		images:loadingImages,
		x:0,
		y:cHeight - 38
	}
	//创建载入状态的构造函数及参数对象
	function Loading(config){
		this.images = config.images;
		this.x = config.x;
		this.y = config.y;
		var frame = 0;
		var times = 0;
		this.paint = function(){
			context.drawImage(this.images[frame],this.x,this.y);
		}
		this.move = function(){
			times++;
			this.paint();
			if(times%10 == 0){
				frame ++;
			}
			if(frame > 3){
				state = RUNNING;
			}
		}
	}
	/**************3.游戏运行阶段**************/
	//创建hero飞机的构造函数及参数对象
	var heroimages = [];
	for(var i=0;i<2;i++){
		heroimages[i] = new Image();
		heroimages[i].src = "../img/pencilPilot/hero"+ (i+1) +".png";
	}
	for(var i=0;i<4;i++){
		heroimages[i+2] = new Image();
		heroimages[i+2].src = "../img/pencilPilot/hero_blowup_n"+ (i+1) +".png";
	}
	var heroConfig = {
		images:heroimages,
		width:99,
		height:124,
		life:3,
		x:cWidth/2 - 50,
		y:cHeight -150,
		frame:0
	}
	function Hero(config){
		this.images = config.images;
		this.width = config.width;									 
		this.height = config.height;	 							 
		this.x = config.x;          								 
		this.y = config.y;				  								
		this.life = config.life;		 								 
		this.frame = config.frame;							 			 
		this.isDied = false;		//hero是否能够被删除
		this.paint = function(){
			context.drawImage(this.images[this.frame],this.x,this.y);
		}
		this.crash = function(){
			if(this.isDied){
				if(this.frame = this.images.length-1){
					this.life--;
				}else{
					this.frame++;
				}
			}
		}
		this.move = function(){
			this.paint();
			this.crash();
			this.frame++;
			if(this.frame == 2){
				this.frame = 0;
			}
		}
	}
	//创建子弹的构造函数及参数对象
	var bullitImage = new Image;
	bullitImage.src = "../img/pencilPilot/bullet1.png"
	var bullitConfig = {
		image:bullitImage,
		width:9,				
		height:21	
	}
	function Bullit(config){
		this.image = config.image;
		this.x = hero.x + hero.width/2 -4;
		this.y = hero.y - 21;
		this.width = config.width;
		this.height = config.height;
		this.isDead = false;
		this.paint = function(){
			context.drawImage(this.image,this.x,this.y);
		}
		this.move = function(){
			this.paint();
			this.y -= 4;
		}
		this.outOfScreen = function(){
			return (this.y + this.height < 0);
		}
	}
	//创建敌机的构造函数及参数对象
	var e1Images = [],
		e2Images = [],
		e3Images = [];
	e1Images[0] = new Image();
	e1Images[0].src =  "../img/pencilPilot/enemy1.png"
	e2Images[0] = new Image();
	e2Images[0].src =  "../img/pencilPilot/enemy2.png"
	e3Images[0] = new Image();
	e3Images[0].src =  "../img/pencilPilot/enemy3_n1.png"
	for(var i=0;i<4;i++){
		e1Images[i+1] = new Image();
		e1Images[i+1].src = "../img/pencilPilot/enemy1_down"+ (i+1) +".png";
	}
	for(var i=0;i<4;i++){
		e2Images[i+1] = new Image();
		e2Images[i+1].src = "../img/pencilPilot/enemy2_down"+ (i+1) +".png";
	}
	for(var i=0;i<6;i++){
		e3Images[i+1] = new Image();
		e3Images[i+1].src = "../img/pencilPilot/enemy3_down"+ (i+1) +".png";
	}
	var e1Config = {
		type:1,
		images:e1Images,
		frame:0,
		width:57,
		height:51,
		life:1
	}
	var e2Config = {
		type:2,
		images:e2Images,
		frame:0,
		width:69,
		height:95,
		life:3
	}
	var e3Config = {
		type:3,
		images:e3Images,
		frame:0,
		width:169,
		height:258,
		life:10
	}
	function Enemy(config){
		this.images = config.images;
		this.type = config.type;
		this.life = config.life;
		this.frame = config.frame;
		this.width = config.width;
		this.height = config.height;
		this.x = parseInt(Math.random()*(cWidth - this.width));
		this.y = -this.height;
		this.isDead = false;
		this.paint = function(){
			context.drawImage(this.images[this.frame],this.x,this.y);
		}
		this.move = function(){
			switch(this.type){
				case 1:
				this.y +=8;
				break;
				case 2:
				this.y +=4;
				break;
				case 3:
				this.y +=2;
				break;
			}
		}
		this.isHit = function(c){
			return c.x + c.width > this.x &&
				   c.y < this.y + this.height &&
				   c.x < this.x + this.width &&
				   c.y + c.height > this.y; 
		}
		this.outOfScreen = function(){
			return (this.y - this.height >cHeight);
		}
		this.crash = function(){
			this.life --;
			if(this.life == 0){
				this.isDead = true;
			}
		}
	}
	
	/**************4.游戏暂停阶段**************/
	/**************5.游戏结束阶段**************/
	/**************生成游戏对象实例**************/
	//天空背景
	var sky = new Sky(bgConfig);
	//载入画面
	var loading = new Loading(loadingConfig);
	//hero
	var hero = new Hero(heroConfig);
	//鼠标跟随或手指跟随
	if(isMobile){
		canvas.ontouchmove = function(e){
			e = window.event || e;
			if(state == RUNNING){
				hero.x = e.changedTouches[0].clientX - hero.width/2;
				hero.y = e.changedTouches[0].clientY - hero.height/2;
			}
		}
	}else{
		canvas.onmousemove = function(e){
			e = window.event || e;
			if(state == RUNNING){
				hero.x = e.offsetX - hero.width/2;
				hero.y = e.offsetY - hero.height/2;
			}
		}
	}	
	//bullit
	var bullits = [];
	var bullitsTimes = 0;
	function createBullits(){
		//每500ms创建一个子弹
		if(bullitsTimes%10 == 0){
			bullits[bullits.length] = new Bullit(bullitConfig);
		}
		bullitsTimes ++;
		//子弹运动
		for(var i=0;i<bullits.length;i++){
			bullits[i].move();
		}
	}
	//子弹销毁方法
	function isBullitsDel(){
		for(var i=0;i<bullits.length;i++){
			if(bullits[i].outOfScreen() || bullits[i].isDead){
				bullits.splice(i,1);
				i--;
			}
		}
	}
	//enemies
	var enemies = [];
	function createEnemies(){
		//敌机出现概率
		var num = parseInt(Math.random()*400);
		if(num<10){
			enemies[enemies.length] = new Enemy(e1Config);
		}else if(num>=10&&num<14){
			enemies[enemies.length] = new Enemy(e2Config);
		}else if(num == 200 && enemies.length>0){
			enemies[enemies.length] = new Enemy(e3Config);
		}
		//敌机运动
		for(var i=0;i<enemies.length;i++){
			enemies[i].paint();
			enemies[i].move();
		}
	}
	function isEnemiesdel(){
		for(var i=0;i<enemies.length;i++){
			if(enemies[i].outOfScreen()){
				enemies.splice(i,1);
				i--;
			}else if(enemies[i].isDead){
				if(enemies[i].frame == (enemies[i].images.length-1)){
					enemies.splice(i,1);
					i--;
				}else{
					enemies[i].frame++;
				}
			}
		}
	}
	//判断相撞
	function hit(){
		for(var i=0;i<enemies.length;i++){
			for(var j=0;j<bullits.length;j++){
				if(enemies[i].isHit(bullits[j])){
					enemies[i].crash();
					bullits[j].isDead = true;
				}
			}
			if(enemies[i].isHit(hero)){
				enemies[i].crash();
				hero.isDead = true;
			}
		}
	}
	/**************游戏核心控制器**************/
	setInterval(function(){
		//绘制背景图片并循环移动
		sky.paint();
		sky.move();
		//游戏状态选择器
		switch(state){
			case WELCOM:
				context.drawImage(title,titleX,0);
				break;
			case LAODING:
				loading.move();
				break;
			case RUNNING:
				hero.move();
				createBullits();
				isBullitsDel();
				createEnemies();
				isEnemiesdel();
				hit();
				break;
			case PAUSE:
				break;
			case GAMEOVER:
				break;
		}
	},50)
});
})

