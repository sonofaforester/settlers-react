import { ICatanBot } from './bot';

export type IVertex = number

export type IEdge = [IVertex, IVertex]

export enum Color {
    red,
    orange,
    green,
    blue,
}

export enum Terrain {
    forest,
    pasture,
    hill,
    mountain,
    field,
    desert,
}

export enum Resource {
    bricks,
    wheat,
    ore,
    sheep,
    lumber,
}

export interface IHexagon {
    terrain: Terrain
    dieRoll: number
}

export interface ITown {
    vertex: IVertex
    color: Color
    isCity: boolean
    isPort: boolean
}

export interface IRoad {
    edge: IEdge
    color: Color
}

export interface ICard {
    name: string
    vp: number
    isKnight: boolean
    color?: Color
    wasPlayed?: boolean
    turn?: number
}

export interface IPlayerResources {
    playerColor: Color
    bricks: number
    lumber: number
    ore: number
    sheep: number
    wheat: number
}

export interface ITradingResources {
    bricks?: number
    lumber?: number
    ore?: number
    sheep?: number
    wheat?: number
}

export interface ICatanState {
    allHexagons: IHexagon[]
    // allVertices:
    // totalHexagons: number;
    hexAdjacentVertices: Array<
        [IVertex, IVertex, IVertex, IVertex, IVertex, IVertex]
    >
    vertexAdjacentHexes: IHexagon[][]
    totalVertices: number
    allEdges: IEdge[]

    thiefHex: number

    eventList: IEvent[]

    cards: ICard[]
    players: ICatanBot[]
    playerColors: Color[]
    playerNames: {
        [K in Color]: string
    }
    playerWithLargestArmy: Color | null
    playerWithLongestRoad: Color | null
    roads: () => IRoad[]
    towns: () => ITown[]
    turn: number
    turnSubAction: number
}

export class CatanState implements ICatanState {
    public hexAdjacentVertices: Array<
        [IVertex, IVertex, IVertex, IVertex, IVertex, IVertex]
    >

    public vertexAdjacentHexes: IHexagon[][]
    public allHexagons: IHexagon[]
    public totalVertices: number
    public allEdges: IEdge[]
    public thiefHex: number
    public eventList: IEvent[]
    public cards: ICard[]
    public players: ICatanBot[]
    public playerColors: Color[]
    public playerNames: { 0: string; 1: string; 2: string; 3: string }
    public playerWithLargestArmy: Color | null
    public playerWithLongestRoad: Color | null
    public turn: number
    public turnSubAction: number

    public constructor(init?: Partial<ICatanState>) {
        Object.assign(this, init)
    }

    public roads = (): IRoad[] => {
        const roads: IRoad[] = []
        this.players.forEach((p) => roads.push(...p.roads))
        return roads
    }

    public towns = (): ITown[] => {
        const towns: ITown[] = []
        this.players.forEach((p) => towns.push(...p.towns))
        return towns
    }
}

export interface IPlayerScore extends IPlayerResources {
    playerName: string
    /* playerColor: Color;
    bricks: number;
    wheat: number;
    ore: number;
    sheep: number;
    lumber: number; */
    cards: ICard[]
    roads: IRoad[]
    towns: ITown[]
    hasLargestArmy: boolean
    hasLongestRoad: boolean
}

// [verbosity level, player color | null, text, additional text]
// [1, null, "Initialize game", null]
// [1, null, "Game over", null]
// [1, 'green', "built road", "at [0, 1]"]
// [1, 'blue', "moved the thief", "and stole from"]
// [3, null, "Distribute resources from die roll 5", ""]
export type IEvent = [number, Color | null, string, string | null]
