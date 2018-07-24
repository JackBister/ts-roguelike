import { Message } from "./Message";

export class MessageLog {
    public static fromOtherMessageLog(obj: MessageLog): MessageLog {
        const ret = new MessageLog(obj.x, obj._height, obj.width);
        ret.messages = [ ...ret.messages ];
        return ret;
    }

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
