
var great_div_DOM = document.querySelector('.greatdiv');

var xpadded,ypadded;
var tetro;

var sizex = 30;
var sizey = 21;

var offsetx = 200;
var offsety = 200;

var speed = 400;
var dir = 'd';

var score=  0;


var score_DOM = document.querySelector('.score');

score_DOM.innerHTML="SCORE  "+score;


var player;
var map;
var enemy_list;

var proj_array = [];

class Point{

  constructor(x,y){
    this.x = x;
    this.y = y;
    this.state=false;
    this.color='black';
    this.class="normal-cell";
  }

  getCoordinates(){
    return [this.x,this.y];
  }

  setCoordinates(x,y){
    this.x = x;
    this.y = y;
  }

  getState(){
    return this.state;
  }
  draw(){

    if(this.state==true){
      xpadded = ("00" + this.x).slice (-3);
      ypadded = ("00" + this.y).slice (-3);
    
      document.querySelector("#indiv-"+ xpadded +"-"+ ypadded).style.backgroundColor = this.color;
      
    }
    else{
      xpadded = ("00" + this.x).slice (-3);
      ypadded = ("00" + this.y).slice (-3);
    
      document.querySelector("#indiv-"+ xpadded +"-"+ ypadded).style.backgroundColor = "white";
    }
  }

  setColor(color){
    this.color=color;
  }

  setClass(class_){
    
    xpadded = ("00" + this.x).slice (-3);
    ypadded = ("00" + this.y).slice (-3);
    document.querySelector("#indiv-"+ xpadded +"-"+ ypadded).classList.remove(this.class);
    this.class=class_;
    document.querySelector("#indiv-"+ xpadded +"-"+ ypadded).classList.add(this.class);

  }

  add(){
    this.state=true;
  }
  remove(){
    this.state=false;
  }




}



const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}


function init(){

  for (let x = 0; x < sizex; x++) {
      for (let y = 0; y < sizey; y++) {
          xpadded = ("00" + x).slice (-3);
          ypadded = ("00" + y).slice (-3);
          great_div_DOM.innerHTML += "<div class=\"insidediv\" id=\"indiv-"+ xpadded +"-"+ ypadded + "\"></div>\n";
          document.querySelector("#indiv-"+ xpadded +"-"+ ypadded).style.left = x*28 + offsetx + "px";
          document.querySelector("#indiv-"+ xpadded +"-"+ ypadded).style.top = y*28 + offsety + "px";

      }

    }
}




async function logKey(e) {
  
    switch (e.code) {

      case 'ArrowLeft':
        dir = 'l';
        if(!player.detectCollisions(dir)){
          player.moveAndDraw(dir);
          map.draw();
        }
        
        break;

      case 'ArrowRight':
        dir = 'r';
        if(!player.detectCollisions(dir)){
          player.moveAndDraw(dir);
          map.draw();
        }
        break;

      case 'Space':
        player.shoot();
        break;
    }

    await sleep(speed);
  
}



class Map {

  constructor(width,height){

    this.width=width;
    this.height=height;
    this.map=[];

    for(var i=0; i<this.height; ++i){
      this.map.push(new Array());
      for(var j=0; j<this.width; ++j){
        this.map[i].push(new Point(j,i));

        if(i==0 || i==this.height-1 ||j==0||j==this.width-1){
          this.map[i][j].add();
        }

      }
    }



  }

  draw(){
    for(var i=0; i<this.height; ++i){
      this.map.push(new Array());
      for(var j=0; j<this.width; ++j){
        this.map[i][j].draw();
      }
    }
  }

  getMap(){
    return this.map;
  }

}
  
class Player{
  constructor(x, y ,map){
    this.x=x;
    this.y=y;
    //this.point=new Point(x, sizey-1);
    this.map=map;
  }


  move(direction){
    switch (direction) {
      case 'l':
        this.x--;
        this.map[this.y][this.x].setCoordinates(this.x,this.y);
        break;
    
      case 'r':
        this.x++;
        this.map[this.y][this.x].setCoordinates(this.x,this.y);
        break;


      case 'd':
        this.y++;
        this.map[this.y][this.x].setCoordinates(this.x,this.y);
        break;

      case 'u':
        this.y++;
        this.map[this.y][this.x].setCoordinates(this.x,this.y);
        break;
    }
  }


  draw(){
    this.map[this.y][this.x].add();
  }

  erase(){
    this.map[this.y][this.x].remove();
  }

  moveAndDraw(direction){
    this.erase();
    this.move(direction);
    this.draw();
  }
  getX(){
    return this.x;
  }

  detectCollisions(direction){
    var next_cell;
    switch (direction) {
      case 'l':
        next_cell = this.map[this.y][this.x-1];
        break;
    
      case 'r':
        next_cell = this.map[this.y][this.x+1];
        break;
    }
    

    if(next_cell.getState()==true){
      return true;
    }

    return false;
  }

  async shoot(){
    var proj_x = this.x;
    var proj_y=this.y-1;

    var proj_point = new Point(proj_x, proj_y);

    proj_array.push(proj_point);
    this.map[proj_y][proj_x].setClass("proj-cell");
    this.map[proj_y][proj_x].add();
    
    map.draw();
    await sleep(20);
    while(proj_y>0){
      proj_remove(proj_point);
      this.map[proj_y][proj_x].setClass("normal-cell");
      this.map[proj_y][proj_x].remove();
      map.draw();

      proj_y--;
      proj_point = new Point(proj_x, proj_y);
      proj_array.push(proj_point);
      this.map[proj_y][proj_x].setClass("proj-cell");
      this.map[proj_y][proj_x].add();
      
      await sleep(20);
      map.draw();
    }

    proj_remove(proj_point);
    this.map[proj_y][proj_x].setClass("normal-cell");
    map.draw();


  }



}



class Enemy extends Player {
  constructor(x, y ,map){
    super(x, y ,map);
    this.direction_queue=['d','r','d','l'];
    this.state=true;
  }

  detectCollisions(){
    for(var proj of proj_array){
      var proj_x=proj.getCoordinates()[0]
      var proj_y = proj.getCoordinates()[1]

      if(proj_x == this.x && proj_y == this.y ){
        

        return true;
      }
    }
    return false;
  }

  draw(){
    this.map[this.y][this.x].add();
    this.map[this.y][this.x].setClass("enem-cell");
  }

  erase(){
    this.map[this.y][this.x].remove();
    this.map[this.y][this.x].setClass("normal-cell");
  }

  async auto_move(){ 
    var current_direction = this.direction_queue.pop();
    this.moveAndDraw(current_direction);
    this.direction_queue.unshift(current_direction);
      
    
  }

  async enemy_loop(){
    while(this.state){
      await sleep(speed);

      if(this.state){
        this.auto_move();
        
      }      

    }
  }

  die(){
    this.state=false;
  }


}



function proj_remove(element){

  const index = proj_array.indexOf(element);
  if (index > -1) {
    proj_array.splice(index, 1);
  }

}

map=new Map(sizex,sizey);



//MAIN

document.addEventListener('keydown', logKey);

document.addEventListener('keyup', function(){ speed=400; dir='d';});

function enemy_list_check(){
  
  if(enemy_list.length==0){
    speed+=-50;
    enemy_list=[new Enemy(4,1, map.getMap()), new Enemy(10,1, map.getMap()), new Enemy(18,1, map.getMap()), new Enemy(25,1, map.getMap())];
    enemy_init();
    return
  }


  for(var enemy of enemy_list){
    if(enemy.detectCollisions()){
      const index = enemy_list.indexOf(enemy);
      if (index > -1) {
        enemy_list.splice(index, 1);
      }
      enemy.erase();
      enemy.die();

      score+=1000;
      console.log("score = " + score );
      score_DOM.innerHTML="score : "+score;
    }
    
  }
}

function enemy_init(){
  for(var enemy of enemy_list){
    enemy.enemy_loop();
  }
}



init();

player = new Player(4,sizey-2, map.getMap());


enemy_list=[new Enemy(4,1, map.getMap()), new Enemy(10,1, map.getMap()), new Enemy(18,1, map.getMap()), new Enemy(25,1, map.getMap())];

player.draw();
enemy_init();
//GAME LOOP
async function loop(timestamp) {

  //await sleep(speed);

  //console.log(player.getX());
  enemy_list_check();
  
  map.draw();

  
  window.requestAnimationFrame(loop)
} 
window.requestAnimationFrame(loop)
