import * as ROT from "rot-js";

export function menu(con: ROT.Display,
                     header: string,
                     options: string[],
                     selection: number,
                     width: number,
                     screenWidth: number,
                     screenHeight: number) {
    if (options.length > 26) {
        throw new Error("Cannot have a menu with more than 26 options.");
    }

    const winX = Math.floor(screenWidth / 2 - width / 2);
    const winY = Math.floor(screenHeight / 2 - 27 / 2);

    con.drawText(winX, winY, header, width);

    let y = 1;
    for (const v of options) {
        let text = v;
        if (y === selection + 1) {
            text = "%b{blue}" + v;
        }
        con.drawText(winX, winY + y, text, width);
        y++;
    }
}
