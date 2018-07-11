import { Message } from "./Message";

export class MessageLog {
    public messages: Message[];

    constructor(public x: number, public height: number, public width: number) {
        this.messages = [];

        this.x = x;
        this.height = height;
        this.width = width;
    }

    public addMessage(message: Message) {
        this.messages.push(message);
        if (this.messages.length > this.height) {
            this.messages = this.messages.slice(1);
        }
    }
}
