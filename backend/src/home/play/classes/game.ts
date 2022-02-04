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
    boundBall: Boundaries;
    boundPad_1: Boundaries;
    boundPad_2: Boundaries;
	padTouch: boolean;
	score_p1: number;
	score_p2: number;
	hits_p1: number;
	hits_p2: number;
	start: boolean;
	gameFinished: boolean;
	max_score: number;

    constructor(private id: number) {
        this.id = id;
		this.score_p1 = 0;
		this.score_p2 = 0;
		this.hits_p1 = 0;
		this.hits_p2 = 0;
		this.padTouch = false;
        this.ball = new Ball(10, 10, 0.3, 0.3, { x: this.cWidth / 2, y: this.cHeight / 2 }, { x: 1, y: 1 });
       	this.pad_1 = new Paddle(75, 10, 5000, 5000, { x: 50, y: (this.cHeight / 2) });
	    this.pad_2 = new Paddle(75, 10, 5000, 5000, { x: this.cWidth - 50, y: (this.cHeight / 2) });
        this.boundBall = this.ball.getCollisionBoundaries();
		this.boundPad_1 = this.pad_1.getCollisionBoundaries();
		this.boundPad_2 = this.pad_2.getCollisionBoundaries();
		this.start = false;
		this.gameFinished = false;
		this.max_score = 3;

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
			gameFinished: this.gameFinished,
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
		var left_touch = this.ball.getSpeedRatio().x < 0;
        this.boundBall = this.ball.getCollisionBoundaries();
        this.boundPad_1 = this.pad_1.getCollisionBoundaries();
        this.boundPad_2 = this.pad_2.getCollisionBoundaries();		

        //Collision ball with backPad -> may consider reabse back pad's limits
		if (this.boundBall.left > this.cWidth || this.boundBall.right < 0){
			this.boundBall.left > this.cWidth ? this.score_p1++ : this.score_p2++;
			if (this.score_p1 == this.max_score || this.score_p2 == this.max_score)
				this.gameFinished = true;
            this.start = false;
			this.ball.setVerticalSpeedRatio(0.5);
            this.ball.setSpeedBallX(1);
            this.ball.setSpeedBallY(1);
            this.ball.reverseX();
            this.ball.setPosition({ x: this.cWidth / 2, y: this.cHeight / 2 });
		}
		else if (this.boundBall.bottom >= this.cHeight || this.boundBall.top <= 0) //top bottom wall collision
			this.ball.reverseY();
		else if (this.boundBall.left <= this.boundPad_1.right && left_touch) // left padd collision
		{
			if (this.boundBall.bottom >= this.boundPad_1.top && this.boundBall.top <= this.boundPad_1.bottom)
				this.leftPadCollision();
		}
		else if (this.boundBall.right >= this.boundPad_2.left && !left_touch) // right pad collision
		{
			if (this.boundBall.bottom >= this.boundPad_2.top && this.boundBall.top <= this.boundPad_2.bottom)
				this.rightPadCollision();
		}
	}

	leftPadCollision(){
		this.setVerticalSpeedRatio(this.boundPad_1, this.pad_1);
		var paddMid = this.boundPad_1.left + this.pad_1.getWidth() / 2;
		if (this.boundBall.left >= paddMid)
		{
			this.hits_p1 = this.reverseX(this.hits_p1);
			this.boost(this.pad_1);
		}
		else if (this.boundBall.left >= this.boundPad_1.left && this.boundBall.right <= this.boundPad_1.right)
		{
			this.hits_p1 = this.reverseXY(this.hits_p1);
			this.boost(this.pad_1);
		}
		this.speedUp();
	}

	rightPadCollision(){
		this.setVerticalSpeedRatio(this.boundPad_2, this.pad_2);
		var paddMid = this.boundPad_2.left + this.pad_2.getWidth() / 2;
		if (this.boundBall.right <= paddMid)
		{
			this.hits_p2 = this.reverseX(this.hits_p2)
			this.boost(this.pad_2);
		}
			else if (this.boundBall.right <= this.boundPad_2.right && this.boundBall.left >= this.boundPad_2.left)
		{
			this.hits_p2 = this.reverseXY(this.hits_p2)
			this.boost(this.pad_2);
		}
		this.speedUp();	
	}

	boost(pad: Paddle){
		if (pad.shots && pad.shot_number > 0)
		{
			this.ball.setHorizontalSpeedRatio(3);
			pad.shot_number--;
			pad.shots = false;
		}
		else {
			this.ball.setHorizontalSpeedRatio(1.5);
		}
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
	
	speedUp(){
		if (!this.start) {
			this.ball.setSpeedBallX(1.6);
			this.ball.setSpeedBallY(1.6);
			this.start = true;
		}
		else 
			this.ball.speedUp();
	}
}
