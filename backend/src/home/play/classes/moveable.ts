
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
			top: this.position.y,
			bottom: this.position.y + this.height + 1,
			right: this.position.x + this.width + 1,
			left: this.position.x 
		}
	}
	getObjectCorners(): any {
		return {
			topLeft: this.position.y,
			topRight: this.position.y + this.width,
			bottomRight: this.position.x + this.width + this.height,
			bottomLeft: this.position.x + this.height
		}
	}
    
    getPosition(): iPosition { return (this.position);}

    getWidth(): number { return (this.width); }

    getHeight(): number { return (this.height); }

    setPosition(position: iPosition): void { this.position = position; }

    setYPosition(position: number): void { this.position.y = position; }
}