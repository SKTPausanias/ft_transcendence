
import { Boundaries, iPosition, iSpeedRatio } from "./iPosition";

export abstract class Moveable {

    constructor(private height: number, 
                private width: number, 
                private maxSpeed: number, 
                private position: iPosition) {
    }

    move(speedRatio: iSpeedRatio): void {
        this.position.x += this.maxSpeed * speedRatio.x;
        this.position.y += this.maxSpeed * speedRatio.y;
    }

    
    getCollisionBoundaries(): Boundaries {
        return {
            top: this.position.y - this.height / 2,
            bottom: this.position.y + this.height / 2,
            right: this.position.x + this.width / 2,
            left: this.position.x - this.width / 2
        }
    }
    
    getPosition(): iPosition { return (this.position);}

    getWidth(): number { return (this.width); }

    getHeight(): number { return (this.height); }
}