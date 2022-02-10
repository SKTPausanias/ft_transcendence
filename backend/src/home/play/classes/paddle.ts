import { iSpeedRatio, iPosition } from "./iPosition";
import { Moveable } from "./moveable";

export class Paddle extends Moveable {
    private speedRatio: iSpeedRatio;
    shots: boolean;
    shot_number: number;

    constructor(height: number,
        width: number,
        maxSpeedX: number,
        maxSpeedY: number,
        position: iPosition,
        )
    {
        super(height, width, maxSpeedX, maxSpeedY, position);
        this.speedRatio = {x: 0, y: 0};
        this.shots = false;
        this.shot_number = 3;
    }

    /**
     * Moves object using existing speed ratio
     */
    move() {
        super.moveX(this.speedRatio);
        super.moveY(this.speedRatio);
    }

    moveUp() {
        this.speedRatio.y = -0.001;
        this.move();
    }

    moveDown() {
        this.speedRatio.y = 0.001;
        this.move();
    }

    setShoots(shots: boolean) {
        this.shots = shots;
    }
    getShoots(): number{
        return (this.shot_number);
    }
}