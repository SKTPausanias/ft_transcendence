import { iSpeedRatio, iPosition } from "./iPosition";
import { Moveable } from "./moveable";

export class Ball extends Moveable {
    private speedRatio: iSpeedRatio;
    oldX: number;

    constructor(height: number,
        width: number,
        maxSpeed: number,
        position: iPosition,
        speedRatio: iSpeedRatio)
    {
        super(height, width, maxSpeed, position);
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
        this.speedRatio.x = horizontalSpeedRatio;
    }

    getHorizontalSpeedRatio(): number {
        return (this.speedRatio.x);
    }
    
    /**
     * Moves object using existing speed ratio
     */
    move() {
        super.move(this.speedRatio);
    }
	setSpeedBall(speed: number): void {
		super.setSpeed(speed);
	}

    getSpeedBall(): number {
        return (super.getSpeed());
    }
    
	incrementBallSpeed(){
		if (this.speedRatio.x < 2.5)
            this.speedRatio.x += 0.1;
    }
    
    setOldX(oldX: number) {
        this.oldX = oldX;
    }

    getOldX() {
        return (this.oldX);
    }
}