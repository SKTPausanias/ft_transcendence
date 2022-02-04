import { iSpeedRatio, iPosition } from "./iPosition";
import { Moveable } from "./moveable";

export class Ball extends Moveable {
    private speedRatio: iSpeedRatio;
    oldX: number;

    constructor(height: number,
        width: number,
        maxSpeedX: number,
        maxSpeedY: number,
        position: iPosition,
        speedRatio: iSpeedRatio)
    {
        super(height, width, maxSpeedX, maxSpeedY, position);
        this.speedRatio = speedRatio;
        this.oldX = speedRatio.x;
    }

    /**
     * Reverses the ball in the x direction
     */
    reverseX(): void {
        this.speedRatio.x = -this.speedRatio.x;
    }

    /**
     * Reverses the ball in the y direction
     */
    reverseY(): void {
        this.speedRatio.y = -this.speedRatio.y;
    }

    getSpeedRatio() : iSpeedRatio {
        return (this.speedRatio);
    }

    /**
     * Sets new vertical speed ratio of max speed
     */
    setVerticalSpeedRatio(verticalSpeedRatio: number): void {
        this.speedRatio.y = verticalSpeedRatio;
    }

    setHorizontalSpeedRatio(horizontalSpeedRatio: number): void {
        //this.speedRatio.x = horizontalSpeedRatio;
        console.log(horizontalSpeedRatio);
        super.setSpeedX(horizontalSpeedRatio);
    }

    getHorizontalSpeedRatio(): number {
        return (this.speedRatio.x);
    }
    
    /**
     * Moves object using existing speed ratio
     */
    move() {
        super.moveX(this.speedRatio);
        super.moveY(this.speedRatio);
    }
	setSpeedBall(speed: number): void {
		super.setSpeedX(speed);
	}

    getSpeedBall(): number {
        return (super.getSpeedX());
    }
    
	speedUp(){
		super.speedUp();
    }
}