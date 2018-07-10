import { Message } from "./Message";

export class MessageLog {
    constructor(x: number, height: number, width: number) {
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
    
    public messages: Message[];

    public x: number;
    public height: number;
    public width: number;
}
