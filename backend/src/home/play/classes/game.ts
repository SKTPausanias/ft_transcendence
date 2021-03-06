import { ePlayMode } from "../ePlay";
import { BallI, GameI } from "../iPlay";
import { Ball } from "./ball";
import { Boundaries } from "./iPosition";
import { Moveable } from "./moveable";
import { Paddle } from "./paddle";

export class Game {
	//16 : 9 
    cWidth: number = 800;
    cHeight: number = 450; 
    ball: Ball;
    pad_1: Paddle;
    pad_2: Paddle;
	obstacle: Paddle;
    boundBall: Boundaries;
    boundPad_1: Boundaries;
    boundPad_2: Boundaries;
	boundObstacle: Boundaries;
	padTouch: boolean;
	obstacleTouch: boolean;
	score_p1: number;
	score_p2: number;
	hits_p1: number;
	hits_p2: number;
	start: boolean;
	gameFinished: boolean;
	max_score: number;
	game_mode: number;
	speed: number;
	gameInterval: any;
	first_hit: boolean;
	num_color_p1: number;
	num_color_p2: number;

    constructor(private id: number, gameMode: number) {
		this.game_mode = gameMode;
        this.id = id;
		this.score_p1 = 0;
		this.score_p2 = 0;
		this.hits_p1 = 0;
		this.hits_p2 = 0;
		this.padTouch = false;
        this.ball = new Ball(10, 10, 0.6, 0.6, { x: this.cWidth / 2, y: this.cHeight / 2 }, { x: 1, y: 1 });
       	this.pad_1 = new Paddle(75, 10, 10000, 10000, { x: 50, y: (this.cHeight / 2) });
	    this.pad_2 = new Paddle(75, 10, 10000, 10000, { x: this.cWidth - 50, y: (this.cHeight / 2) });
		this.obstacle = new Paddle(70, 5, 0, 0, { x: this.cWidth / 2, y: (this.cHeight / 2) });
        this.boundBall = this.ball.getCollisionBoundaries();
		this.boundPad_1 = this.pad_1.getCollisionBoundaries();
		this.boundPad_2 = this.pad_2.getCollisionBoundaries();
		this.start = false;
		this.obstacleTouch = false;
		this.gameFinished = false;
		this.max_score = 3;
		this.first_hit = false;
		this.num_color_p1 = 0;
		this.num_color_p2 = 0;
		if (gameMode == ePlayMode.POWER)
			this.max_score = 5;
		else if (gameMode == ePlayMode.ANGLE)
			this.max_score = 7;
		this.speed = 4;
		this.gameInterval = setInterval(()=>{
			this.checkCollisions();
			this.ball.move();
			if (this.score_p1 >= this.max_score || this.score_p2 >= this.max_score){
				this.removeInterval();
				console.log("game finished", this.score_p2);
			}
		}, 10);
    }

    getId (): number{
        return (this.id);
    }

    getMap() : GameI {
        return ({
            map: {
                width: this.cWidth,
                height: this.cHeight
            },
            ball: this.getMoveable(this.ball),
            pad_1: this.getMoveable(this.pad_1),
            pad_2: this.getMoveable(this.pad_2),
			score_p1: this.score_p1,
			score_p2: this.score_p2,
			hits_p1: this.hits_p1,
			hits_p2: this.hits_p2,
			rockets_p1: this.pad_1.getShoots(),
			rockets_p2: this.pad_2.getShoots(), 
			gameFinished: this.gameFinished,
			game_mode : this.game_mode,
			first_hit: this.first_hit,
			color_num_p1: this.num_color_p1,
			color_num_p2: this.num_color_p2
        });
    }
    
    getMoveable(obj: Moveable): BallI {
        var pos = obj.getPosition();
        return ({
            pos_x: pos.x,
            pos_y: pos.y,
            width: obj.getWidth(),
            height: obj.getHeight()
        });
    }

	checkCollisions() {
		var left_touch = this.ball.getHorizontalSpeedRatio() < 0;
        this.boundBall = this.ball.getCollisionBoundaries();
        this.boundPad_1 = this.pad_1.getCollisionBoundaries();
        this.boundPad_2 = this.pad_2.getCollisionBoundaries();
		this.boundObstacle = this.obstacle.getCollisionBoundaries();		

        //Collision ball with backPad -> may consider reabse back pad's limits
		if (this.boundBall.left > this.cWidth || this.boundBall.right < 0){
			this.boundBall.left > this.cWidth ? this.score_p1++ : this.score_p2++;
			/* if (this.score_p1 == this.max_score || this.score_p2 == this.max_score) //this was commented to set the interval.
				this.gameFinished = true; */
            this.start = false;
			this.first_hit = true;
			this.obstacleTouch = false;
			this.ball.setVerticalSpeedRatio(0.5);
            this.ball.setSpeedBallX(1);
            this.ball.setSpeedBallY(1);
            this.ball.reverseX();
            this.ball.setPosition({ x: this.cWidth / 2, y: this.cHeight / 2 });
		}
		//collision with obstacle in game mode 3
		else if (this.boundBall.bottom >= this.cHeight || this.boundBall.top <= 0) //top bottom wall collision
			this.ball.reverseY();
		else if (this.boundBall.left <= this.boundPad_1.right && left_touch) // left padd collision
		{
			this.first_hit = true;
			if (this.boundBall.bottom >= this.boundPad_1.top && this.boundBall.top <= this.boundPad_1.bottom)
				this.leftPadCollision();
		}
		else if (this.boundBall.right >= this.boundPad_2.left && !left_touch) // right pad collision
		{
			this.first_hit = true;
			if (this.boundBall.bottom >= this.boundPad_2.top && this.boundBall.top <= this.boundPad_2.bottom)
				this.rightPadCollision();
		}
		if (this.game_mode == ePlayMode.ANGLE && this.obstacleTouch && 
			(this.boundBall.top <= this.boundObstacle.bottom && this.boundBall.bottom >= this.boundObstacle.top && 
			this.boundBall.left <= this.boundObstacle.right && this.boundBall.right >= this.boundObstacle.left))
			this.crazyCollision();
	}

	leftPadCollision(){
		this.setVerticalSpeedRatio(this.boundPad_1, this.pad_1);
		var paddMid = this.boundPad_1.left + this.pad_1.getWidth() / 2;
		if (this.boundBall.left >= paddMid)
		{
			this.hits_p1 = this.reverseX(this.hits_p1);
			this.game_mode == ePlayMode.POWER ? this.boost(this.pad_1) : null;
		}
		else if (this.boundBall.left >= this.boundPad_1.left && this.boundBall.right <= this.boundPad_1.right)
		{
			this.hits_p1 = this.reverseXY(this.hits_p1);
			this.game_mode == ePlayMode.POWER ? this.boost(this.pad_1) : null;
		}
		this.obstacleTouch = true;
		this.game_mode == ePlayMode.CLASIC ? this.speedUp() : this.speedUp(this.speed);
	}

	rightPadCollision(){
		this.setVerticalSpeedRatio(this.boundPad_2, this.pad_2);
		var paddMid = this.boundPad_2.left + this.pad_2.getWidth() / 2;
		if (this.boundBall.right <= paddMid)
		{
			this.hits_p2 = this.reverseX(this.hits_p2);
			this.game_mode == ePlayMode.POWER ? this.boost(this.pad_2) : null;
		}
			else if (this.boundBall.right <= this.boundPad_2.right && this.boundBall.left >= this.boundPad_2.left)
		{
			this.hits_p2 = this.reverseXY(this.hits_p2)
			this.game_mode == ePlayMode.POWER ? this.boost(this.pad_2) : null;
		}
		this.obstacleTouch = true;
		this.game_mode == ePlayMode.CLASIC ? this.speedUp() : this.speedUp(this.speed);
	}

	boost(pad: Paddle){
		if (pad.shots && pad.shot_number > 0)
		{
			this.ball.setHorizontalSpeed(5);
			pad.shot_number--;
			pad.shots = false;
		}
		else {
			this.ball.setHorizontalSpeed(this.speed);
		}
	}

	crazyCollision(){

		console.log("crazy coolition");
		var dirX = (Math.round(Math.random())) == 1 ? 1 : -1;
		var dirY = (Math.round(Math.random())) == 1 ? 1 : -1;
		this.obstacleTouch = false;

		//make the ball go random direction and speed (between 1.5 and 3)
		this.ball.setHorizontalSpeed((Math.random() * 2 + 2.5)); 
		this.ball.setVerticalSpeed((Math.random() * 2 + 2.5));
		this.ball.setHorizontalSpeedRatio(dirX * this.ball.getHorizontalSpeedRatio());
		this.ball.setVerticalSpeedRatio(dirY * this.ball.getVerticalSpeedRatio() + 1.8);
	}
	
	setVerticalSpeedRatio(bound: Boundaries, pad: Paddle)
	{
		var middle = bound.top + pad.getHeight() / 2;
		// abs value of distance
		var distance = Math.abs(middle - this.boundBall.top);
		// increment vertical speed ratio as distance incremenets
		this.ball.setVerticalSpeedRatio((distance / (pad.getHeight() / 2.5)));
	}

	reverseX(hit: number){
		this.ball.reverseX();
		return (hit + 1);
	}

	reverseXY(hit: number){
		this.ball.reverseY();
		this.ball.reverseX();
		return (hit + 1);
	}
	
	speedUp(spd?: number){
		var speed = spd? spd: 2.6;
		if (!this.start) {
			
			this.ball.setSpeedBallX(speed);
			this.ball.setSpeedBallY(speed);
			this.start = true;
		}
		else if (this.game_mode == ePlayMode.CLASIC)
			this.ball.speedUp();
	}
	removeInterval(){
		clearInterval(this.gameInterval);
		this.gameInterval = undefined;
	}

	changeColor(pad_id: number, val: number):void {
		if (val == 0){
			if (pad_id == 0)
				this.num_color_p1 = 0;
			else
				this.num_color_p2 = 0;
		} else if (val == 1){
			if (pad_id == 0)
				this.num_color_p1 = 1;
			else
				this.num_color_p2 = 1;
		} else if (val == 2){
			if (pad_id == 0)
				this.num_color_p1 = 2;
			else
				this.num_color_p2 = 2;
		} else if (val == 3){
			if (pad_id == 0)
				this.num_color_p1 = 3;
			else
				this.num_color_p2 = 3;
		}
	}
}
