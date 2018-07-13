import { Message } from "./Message";

export class MessageLog {
    public messages: Message[];

    constructor(public x: number, private _height: number, public width: number) {
        this.messages = [];
    }

    public addMessage(message: Message) {
        this.messages.push(message);
        this.sliceExcessMessages();
    }

    set height(val: number) {
        this._height = val;
        this.sliceExcessMessages();
    }

    private sliceExcessMessages() {
        if (this.messages.length > this._height) {
            const toSlice = this.messages.length - this._height;
            this.messages = this.messages.slice(toSlice);
        }
    }
}
