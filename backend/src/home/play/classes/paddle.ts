import { iSpeedRatio, iPosition } from "./iPosition";
import { Moveable } from "./moveable";

export class Paddle extends Moveable {
    private speedRatio: iSpeedRatio;
    shots: boolean;
    shot_number: number;

    constructor(height: number,
        width: number,
        maxSpeed: number,
        position: iPosition,
        )
    {
        super(height, width, maxSpeed, position);
        this.speedRatio = {x: 0, y: 0};
        this.shots = false;
        this.shot_number = 3;
    }

    /**
     * Moves object using existing speed ratio
     */
    move() {
        super.move(this.speedRatio);
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
}