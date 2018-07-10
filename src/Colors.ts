import * as ROT from 'rot-js'

interface ColorMap {
    [key: string]: string
}

export const COLORS: ColorMap = {
    darkGround: ROT.Color.toRGB([50, 50, 150]),
    darkWall: ROT.Color.toRGB([0, 0, 100]),

    lightGround: ROT.Color.toRGB([200, 180, 50]),
    lightWall: ROT.Color.toRGB([130, 110, 50])
};
