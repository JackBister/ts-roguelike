
export class Rect {
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.x2 = x + w;
        this.y2 = y + h;
    }

    public getCenter() {
        return [
            Math.floor((this.x + this.x2) / 2),
            Math.floor((this.y + this.y2) / 2)
        ];
    }

    public getX() {
        return this.x;
    }

    public getY() {
        return this.y;
    }

    public getX2() {
        return this.x2;
    }

    public getY2() {
        return this.y2;
    }

    public intersects(r2: Rect) {
        return this.x <= r2.x2 && this.x2 >= r2.x
            && this.y <= r2.y2 && this.y2 >= r2.y;
    }

    private x: number;
    private y: number;
    private x2: number;
    private y2: number;
}
