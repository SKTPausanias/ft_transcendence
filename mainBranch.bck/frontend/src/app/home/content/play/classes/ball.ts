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
}