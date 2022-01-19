import { iSpeedRatio, iPosition } from "./iPosition";
import { Moveable } from "./moveable";

export class Paddle extends Moveable {
    private speedRatio: iSpeedRatio;

    constructor(height: number,
        width: number,
        maxSpeed: number,
        position: iPosition,
        )
    {
        super(height, width, maxSpeed, position);
        this.speedRatio = {x: 0, y: 0};
    }

    /**
     * Moves object using existing speed ratio
     */
    move() {
        super.move(this.speedRatio);
    }

    moveUp() {
        this.speedRatio.y = -0.002;
        this.move();
    }

    moveDown() {
        this.speedRatio.y = 0.002;
        this.move();
    }
}