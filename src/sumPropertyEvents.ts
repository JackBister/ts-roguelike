import { EventResult } from "./EventResult";

export function sumPropertyEvents(events: EventResult[]) {
    return events.reduce(
        (a, b) => {
            if (b.type === "getProperty") {
                return a + b.value;
            }
        },
        0,
    );
}
