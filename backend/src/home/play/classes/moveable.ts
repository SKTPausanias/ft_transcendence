
import { Boundaries, iPosition, iSpeedRatio } from "./iPosition";

export abstract class Moveable {

    constructor(private height: number, 
                private width: number, 
                private maxSpeedX: number,
				private maxSpeedY: number, 
                public position: iPosition) {
    }

    /*move(speedRatio: iSpeedRatio): void {
        //this.position.x += this.maxSpeed * speedRatio.x;
       
    }*/
	moveX(speedRatio: iSpeedRatio): void {
		this.position.x += this.maxSpeedX * speedRatio.x;
	}
	moveY(speedRatio: iSpeedRatio): void {
		this.position.y += this.maxSpeedY * speedRatio.y;
	}
	getCollisionBoundaries(): Boundaries {
		return {
			top: this.position.y,
			bottom: this.position.y + this.height,
			right: this.position.x + this.width,
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

	setSpeedX(speed: number) {
		this.maxSpeedX = speed;
	}
	setSpeedY(speed: number) {
		this.maxSpeedY = speed;
	}

	getSpeedX(): number {
		return (this.maxSpeedX);
	}

	speedUp() {
		console.log("speddball: ", this.maxSpeedX);
		if (this.maxSpeedX < 5)
		this.maxSpeedX += 0.2;
	}
}
