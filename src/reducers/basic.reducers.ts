import { INITIALIZE_GAME } from '../actions';
import {
    cardList, edgeList, hexAdjacentVertices, hexList, numVertices, playerColors, vertexAdjacentHexes
} from '../constants';
import { CatanState, Color, ICatanState, IRoad, ITown, Resource, Terrain } from '../types';
import {
    convertTerrainToResource, getCurrentPlayer, getCurrentPlayerColor, newEvent
} from '../utils/utils';

export const initializeState = (): ICatanState => {
    const playerNames = playerColors.reduce((accm, color) => {
        accm[color] = ''
        return accm
    }, {} as { [K in Color]: string }) // hacky
    const initialState = {
        allEdges: edgeList,
        allHexagons: hexList(),
        cards: cardList,
        eventList: [newEvent(INITIALIZE_GAME, null, 'Initialize game')],
        hexAdjacentVertices,
        playerColors,
        playerNames,
        playerWithLargestArmy: null,
        playerWithLongestRoad: null,
        players: [],
        thiefHex: hexList().findIndex((hex) => hex.terrain === Terrain.desert),
        totalVertices: numVertices,
        turn: 0,
        turnSubAction: 0,
        vertexAdjacentHexes,
    }

    return new CatanState(initialState)
}

export const setPlayerNames = (state: ICatanState, action: any) => {
    return {
        ...state,
        playerNames: action.playerNames,
    }
}

export const endPlayerTurn = (state: ICatanState, action: any) => {
    const currentColor = getCurrentPlayerColor(state)
    let event = newEvent(action.type, currentColor, 'ends turn')
    if (state.turnSubAction === 1) {
        event = newEvent(action.type, currentColor, 'passes')
    }
    return {
        ...state,
        eventList: [...state.eventList, event],
        turn: state.turn + 1,
        turnSubAction: 0,
    }
}

export const initialMove1 = (state: ICatanState, action: any) => {
    // TODO: check that townVertex and roadEdge is available

    const currentPlayer = getCurrentPlayer(state)
    const newTown: ITown = {
        color: currentPlayer.color,
        isCity: false,
        isPort: false,
        vertex: action.townVertex,
    }
    const newRoad: IRoad = {
        color: currentPlayer.color,
        edge: action.roadEdge,
    }

    currentPlayer.roads.push(newRoad)
    currentPlayer.towns.push(newTown)

    return {
        ...state,
        eventList: [
            ...state.eventList,
            newEvent(action.type, currentPlayer.color, 'makes initial move 1'),
        ],
    }
}

export const initialMove2 = (state: ICatanState, action: any) => {
    // TODO: check that townVertex and roadEdge is available
    const currentPlayer = getCurrentPlayer(state)
    const newTown: ITown = {
        color: currentPlayer.color,
        isCity: false,
        isPort: false,
        vertex: action.townVertex,
    }
    const newRoad: IRoad = {
        color: currentPlayer.color,
        edge: action.roadEdge,
    }

    currentPlayer.roads.push(newRoad)
    currentPlayer.towns.push(newTown)

    // get surrounding hexagons
    const adjHexagons = state.hexAdjacentVertices.reduce(
        (accm, adjVtces, index) => {
            if (adjVtces.indexOf(action.townVertex) > -1) {
                return [...accm, index]
            } else {
                return accm
            }
        },
        []
    )

    adjHexagons.forEach((hexIdx) => {
        const res = convertTerrainToResource(state.allHexagons[hexIdx].terrain)
        if (res) {
            currentPlayer.playerResources[res] =
                currentPlayer.playerResources[res] + 1
        }
    })

    return {
        ...state,
        eventList: [
            ...state.eventList,
            newEvent(action.type, currentPlayer.color, 'makes initial move 2'),
        ],
    }
}

export const distributeResources = (state: ICatanState, action: any) => {
    const dieRoll = action.dieRoll

    // get all hexes with matching dieRoll
    const matchingHexagons = state.allHexagons.reduce((accm, hex, index) => {
        if (hex.dieRoll === dieRoll) {
            return [...accm, index]
        } else {
            return accm
        }
    }, [])

    // for each hexagon, distribute resources to adjacent cities
    matchingHexagons.forEach((hexIdx) => {
        const adjVtces = state.hexAdjacentVertices[hexIdx]
        const res = convertTerrainToResource(state.allHexagons[hexIdx].terrain)
        // for each vertex, get the town
        if (res) {
            state
                .towns()
                .filter((town) => adjVtces.indexOf(town.vertex) > -1)
                .forEach((town) => {
                    state.players[town.color].playerResources[Resource[res]] =
                        state.players[town.color].playerResources[
                            Resource[res]
                        ] + (town.isCity ? 2 : 1)
                })
        }
    })

    return {
        ...state,
        eventList: [
            ...state.eventList,
            newEvent(
                action.type,
                null,
                'Distribute resources from die roll ' + dieRoll
            ),
        ],
        turnSubAction: state.turnSubAction + 1,
    }
}

export const moveThief = (state: ICatanState, action: any) => {
    // TODO: check that the new thiefHex is different from the old one
    // TODO: check that target player has a town/city on newHex

    const currentResources = state.players.map((p) => p.playerResources)
    const currentColor = getCurrentPlayerColor(state)
    // get random resource from
    if (action.targetPlayer) {
        const targetResources: string[] = []
        targetResources.fill(
            'bricks',
            0,
            currentResources[action.targetPlayer].bricks
        )
        targetResources.fill(
            'lumber',
            targetResources.length,
            targetResources.length +
                currentResources[action.targetPlayer].bricks
        )
        targetResources.fill(
            'ore',
            targetResources.length,
            targetResources.length +
                currentResources[action.targetPlayer].bricks
        )
        targetResources.fill(
            'sheep',
            targetResources.length,
            targetResources.length +
                currentResources[action.targetPlayer].bricks
        )
        targetResources.fill(
            'wheat',
            targetResources.length,
            targetResources.length +
                currentResources[action.targetPlayer].bricks
        )

        const randomIdx = Math.floor(
            Math.random() * (targetResources.length - 1)
        )
        const randomTargetResource = targetResources[randomIdx]

        currentResources[action.targetPlayer][randomTargetResource] =
            currentResources[action.targetPlayer][randomTargetResource] - 1
        currentResources[currentColor][randomTargetResource] =
            currentResources[currentColor][randomTargetResource] + 1
    }

    return {
        ...state,
        eventList: [
            ...state.eventList,
            newEvent(action.type, currentColor, 'moves thief'),
        ],
        thiefHex: action.newHex,
        turnSubAction: state.turnSubAction + 1,
    }
}

export const discardHalfResources = (state: ICatanState, action: any) => {
    return state
}
