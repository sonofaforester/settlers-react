import { IHexagon, Terrain } from '../types';

let computedHexList: IHexagon[]

const computeHexList = (): IHexagon[] => {
    const tiles: Terrain[] = [
        Terrain.forest,
        Terrain.forest,
        Terrain.forest,
        Terrain.forest,
        Terrain.pasture,
        Terrain.pasture,
        Terrain.pasture,
        Terrain.pasture,
        Terrain.field,
        Terrain.field,
        Terrain.field,
        Terrain.field,
        Terrain.hill,
        Terrain.hill,
        Terrain.hill,
        Terrain.mountain,
        Terrain.mountain,
        Terrain.mountain,
        Terrain.desert,
    ]

    const dieRolls: number[] = [
        2,
        3,
        3,
        4,
        4,
        5,
        5,
        6,
        6,
        8,
        8,
        9,
        9,
        10,
        10,
        11,
        11,
        12,
    ]

    const retval: IHexagon[] = []

    while (tiles.length > 0) {
        const tileIdx = Math.floor(Math.random() * tiles.length)
        const dieIdx = Math.floor(Math.random() * dieRolls.length)
        const terrain = tiles[tileIdx]
        tiles.splice(tileIdx, 1)

        let dieRoll = 7

        if (terrain !== Terrain.desert) {
            dieRoll = dieRolls[dieIdx]
            dieRolls.splice(dieIdx, 1)
        }

        retval.push({
            dieRoll,
            terrain,
        })
    }

    return retval
}

export const hexList = (): IHexagon[] => {
    if (!computedHexList) {
        computedHexList = computeHexList()
    }

    return computedHexList
}
