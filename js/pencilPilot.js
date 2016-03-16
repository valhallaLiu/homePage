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
	var superMode = false;
	var countDeadEnemies = 0;
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
			//height = parseInt(width/ratio);
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
	//设置游戏计分和生命数值
	function paintLife(){
		context.strokeText("分数:"+score,10,40);
		context.strokeText("生命:"+hero.life,(cWidth-100),40)
		context.font = "bold 26px Microsoft Yahei"
	
	}
	/**************1.游戏欢迎阶段**************/
	//创建背景图片和标题图片
	var bg = new Image(),
		title = new Image(),
		gameOver = new Image(),
		pause = new Image();
	bg.src = "../img/pencilPilot/background.png";
	title.src = "../img/pencilPilot/start.png";
	gameOver.src = "../img/pencilPilot/gameover.png";
	pause.src = "../img/pencilPilot/pause.png";
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
		life:10,
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
		this.isDead = false;		//hero是否能够被删除
		this.isDel = false;
		this.paint = function(){
			context.drawImage(this.images[this.frame],this.x,this.y);
		}
		this.move = function(){
			this.frame++;
			if(this.isDead){
				if(this.frame = this.images.length-1){
					this.isDead = false;
					this.isDel = true;
				}
			}else if(this.frame == 2){
				this.frame = 0;
			}
			this.paint();
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
			/*context.drawImage(this.image,this.x-32,this.y+42);
			context.drawImage(this.image,this.x+32,this.y+42);*/
		}
		this.move = function(){
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
	//创建bouns的构造函数及参数对象
	var bounsImage = new Image();
	bounsImage.src = "../img/pencilPilot/bouns.png";
	var bounsMkImage = new Image();
	bounsMkImage.src = "../img/pencilPilot/superBullits.png";
	var bounsConfig = {
		image:bounsImage,
		width:57,
		height:51
	}
	var bounsMkConfig = {
		image:bounsMkImage,
		width:57,
		height:51
	}
	function Bouns(config){
		this.image = config.image;
		this.width = config.width;
		this.height = config.height;
		this.x = parseInt(Math.random()*(cWidth - this.width));
		this.y = -this.height;
		this.isClear = false;
		this.paint = function(){
			context.drawImage(this.image,this.x,this.y);
		};
		this.move = function(){
			this.y += 10;
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
	}
	/**************4.游戏暂停阶段**************/
	//游戏暂停时，仅仅绘制当前已存在的对象
	function gamePause(){
		hero.paint();
		for(var i=0;i<bullits.length;i++){
			bullits[i].paint();
		}
		for(var j=0;j<enemies.length;j++){
			enemies[j].paint();
		}
	}
	
	/**************5.游戏结束阶段**************/
	/**************生成游戏对象实例**************/
	//天空背景
	var sky = new Sky(bgConfig);
	//载入画面
	var loading = new Loading(loadingConfig);
	//hero
	var hero = new Hero(heroConfig);
	//hero是否删除
	function isHeroDel(){
		if(hero.isDel){
			hero.life-- ;
			heroConfig.life--;
			if(hero.life == 0){
				state = GAMEOVER;
			}else{
				hero.isDel = false;
					hero = new Hero(heroConfig);
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
			if(superMode){
				for(var j=0;j<2;j++){
					bullits[bullits.length] = new Bullit(bullitConfig);
					if(j==0){
						bullits[bullits.length-1].x -= 32;
						bullits[bullits.length-1].y += 42;
					}else{
						bullits[bullits.length-1].x += 32;
						bullits[bullits.length-1].y += 42;
					}
				}
			}
			
		}
		bullitsTimes ++;
		//子弹运动
		for(var i=0;i<bullits.length;i++){
			bullits[i].paint();
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
	function isEnemiesDel(){
		for(var i=0;i<enemies.length;i++){
			if(enemies[i].outOfScreen()){
				enemies.splice(i,1);
				i--;
			}else if(enemies[i].isDead){
				if(enemies[i].frame == (enemies[i].images.length-1)){
					//根据敌机类型计算分数
					switch(enemies[i].type){
						case 1:
							score++;
							break;
						case 2:
							score += 3;
							break;
						case 3:
							score += 10;
							break;
					}
					//删除飞机
					enemies.splice(i,1);
					i--;
					countDeadEnemies++;
				}else{
					enemies[i].frame++;
				}
			}
		}
	}
	//bouns
	var bouns = [];
	var bounsMk = [];
	var bounsMkTimes = 0;
	function createBouns(){
		if(countDeadEnemies > 10){
			countDeadEnemies = -90;
			bounsMkTimes++;
			bouns[bouns.length] = new Bouns(bounsConfig);
		}
		if(bounsMkTimes > 0){
			bounsMkTimes = 0;
			bounsMk[bounsMk.length] = new Bouns(bounsMkConfig);
		}
		if(bouns.length >0){
			for(i=0;i<bouns.length;i++){
				bouns[i].paint();
				bouns[i].move();	
			}
		}
		if(bounsMk.length >0){
			for(j=0;j<bounsMk.length;j++){
				bounsMk[j].paint();
				bounsMk[j].move();	
			}
		}
	}
	function isBounsDel(){
		for(var i=0;i<bouns.length;i++){
			if(bouns[i].outOfScreen() || bouns[i].isClear){
				bouns.splice(i,1);
				i--;
			}
		}
		for(var j=0;j<bounsMk.length;j++){
			if(bounsMk[j].outOfScreen() || bounsMk[j].isClear){
				bounsMk.splice(j,1);
				j--;
			}
		}
	}
	//判断相撞
	function hit(){
		//判断敌人和子弹、hero相撞
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
	function hitBouns(){
		//判断bounsMk和hero相撞
		for(var i=0;i<bounsMk.length;i++){
			if(bounsMk[i].isHit(hero)){
				superMode = true;
				bounsMk[i].isClear = true;
			}
		}
		//判断bouns和hero相撞
		for(var j=0;j<bouns.length;j++){
			if(bouns[j].isHit(hero)){
				for(var k=0;k<enemies.length;k++){
					enemies[k].isDead = true;
				}
				bouns[j].isClear = true;
			}
		}
	}
	/**************游戏中的事件**************/
	//点击开始事件
	canvas.onclick = function(){
		if(state == WELCOM ){
			state = LAODING;
		}else if(state == GAMEOVER){
			//score = 0;
			location.reload();
		}
	}
	//空格暂停事件，以及键盘操控飞机
	$(document).keydown(function(e){
		e = window.event || e;
		if(e.keyCode == 32){
			switch(state){
				case 2:
					state = 3;
					break;
				case 3:
					state = 2;
					break;
			}
		}
		/*switch(e.keyCode){
			case 37:
				if(hero.x > 15)
					hero.x -= 15;	
				break;
			case 38:
				if(hero.y > 15)
					hero.y -= 15;	
				break;
			case 39:
				if(hero.x < (cWidth-15))
					hero.x += 15;
				break;
			case 40:
				if(hero.y < (cHeight-15))
					hero.y += 15;
				break;
		}*/
	})
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
	//阻止苹果的“拉橡皮筋”效果
	if(isIphone){
		function preventDefault(ev) {
  			ev.preventDefault();
		}
		document.addEventListener('touchmove', preventDefault);
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
				isHeroDel();
				createBullits();
				isBullitsDel();
				createEnemies();
				isEnemiesDel();
				createBouns();
				isBounsDel();
				hit();
				hitBouns();
				break;
			case PAUSE:
				gamePause();
				context.drawImage(pause,titleX,100);
				break;
			case GAMEOVER:
				context.drawImage(gameOver,titleX,100);
				break;
		}
		//计分和生命剩余数
		 paintLife();
	},50)
});
})

