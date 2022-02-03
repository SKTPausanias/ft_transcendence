import { iSpeedRatio, iPosition } from "./iPosition";
import { Moveable } from "./moveable";

export class Ball extends Moveable {
    private speedRatio: iSpeedRatio;

    constructor(height: number,
        width: number,
        maxSpeed: number,
        position: iPosition,
        speedRatio: iSpeedRatio)
    {
        super(height, width, maxSpeed, position);
        this.speedRatio = speedRatio;
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
		super.incrementSpeed();
	}
	moveTest(w:number, h: number) {
		var ballPos = this.getPosition();
		// W H campo
		// POS BALL

		//CAMPO PARTE ARRIBA ABAJO
		if (ballPos.y <= 0 || ballPos.y + this.getHeight() >= h)
		{
			this.reverseY();
			//console.log("ball pos: ", ballPos);
		}
			
		//CAMPO PARTE DERECHA IZQUIERDA
		else if (ballPos.x <=0 || ballPos.x + this.getWidth() >= w)
		{
			this.reverseX();
			console.log("LOST: ", ballPos);
		}
        super.move(this.speedRatio);
    }
}