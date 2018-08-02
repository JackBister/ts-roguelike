import { Message } from "./Message";

export class MessageLog {
    public static addMessage(log: MessageLog, message: Message) {
        log.messages.push(message);
        MessageLog.sliceExcessMessages(log);
    }

    public static setHeight(log: MessageLog, val: number) {
        log._height = val;
        MessageLog.sliceExcessMessages(log);
    }

    private static sliceExcessMessages(log: MessageLog) {
        if (log.messages.length > log._height) {
            const toSlice = log.messages.length - log._height;
            log.messages = log.messages.slice(toSlice);
        }
    }

    public messages: Message[];

    constructor(public x: number, private _height: number, public width: number) {
        this.messages = [];
    }

}
