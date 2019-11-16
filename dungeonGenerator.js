function Dungeon(){
	this.areas = [];
	this.init = function (){
			areas[0] = startingArea();
			generate(areas);
	}
}
function Room(){
	this.walls = [];
	this.passages = []; // 4 sides for rect, 8 for circle
	this.setPassage = function (side,width){
		this.passages[side] = width;
	}
}

var dungeon = new Dungeon();
dungeon.init();

function startingArea(){

}

function areas(areas)