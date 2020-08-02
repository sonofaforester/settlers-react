import { INITIALIZE_GAME } from '../actions';
import {cardList, edgeList, hexAdjacentVertices, hexList, numVertices, playerColors, vertexAdjacentHexes} from '../constants';
import {Color, ICatanState, IPlayerResources, IRoad, ITown} from '../types';
import { convertTerrainToResource, getCurrentPlayerColor, newEvent } from '../utils/utils';

export const initializeState = () => {
    const playerResources =
        playerColors.reduce((accm, color) => {
            accm[color] = ({
                bricks: 0,
                lumber: 0,
                ore: 0,
                sheep: 0,
                wheat: 0
            } as IPlayerResources);
            return accm;
        }, {} as {[K in Color]: IPlayerResources}); // hacky
    const playerNames =
        playerColors.reduce((accm, color) => {
            accm[color] = '';
            return accm;
        }, {} as {[K in Color]: string}); // hacky
    return {
        allEdges: edgeList,
        allHexagons: hexList,
        cards: cardList,
        eventList: [newEvent(INITIALIZE_GAME, null, 'Initialize game')],
        hexAdjacentVertices,
        playerColors,
        playerNames,
        playerResources,
        playerWithLargestArmy: null,
        playerWithLongestRoad: null,
        roads: [],
        thiefHex: hexList.findIndex(hex => hex.terrain === 'desert'),
        totalVertices: numVertices,
        towns: [],
        turn: 0,
        turnSubAction: 0,
        vertexAdjacentHexes
    };
};

export const setPlayerNames = (state: ICatanState, action: any) => {
    return {
        ...state,
        playerNames: action.playerNames
    };
};

export const endPlayerTurn = (state: ICatanState, action: any) => {
    const currentColor = getCurrentPlayerColor(state);
    let event = newEvent(action.type, currentColor, 'ends turn');
    if (state.turnSubAction === 1) {
        event = newEvent(action.type, currentColor, 'passes');
    }
    return {
        ...state,
        eventList: [...state.eventList, event],
        turn: state.turn + 1,
        turnSubAction: 0
    };
};

export const initialMove1 = (state: ICatanState, action: any) => {
    // TODO: check that townVertex and roadEdge is available

    const currentColor = getCurrentPlayerColor(state);
    const newTown: ITown = {
        color: currentColor,
        isCity: false,
        isPort: false,
        vertex: action.townVertex
    };
    const newRoad: IRoad = {
        color: currentColor,
        edge: action.roadEdge
    };
    return {
        ...state,
        eventList: [...state.eventList, newEvent(action.type, currentColor, 'makes initial move 1')],
        roads: [...state.roads, newRoad],
        towns: [...state.towns, newTown],
    };
};

export const initialMove2 = (state: ICatanState, action: any) => {
    // TODO: check that townVertex and roadEdge is available
    const currentColor = getCurrentPlayerColor(state);
    const currentResources = state.playerResources[currentColor];
    const newTown: ITown = {
        color: currentColor,
        isCity: false,
        isPort: false,
        vertex: action.townVertex
    };
    const newRoad: IRoad = {
        color: currentColor,
        edge: action.roadEdge
    };
    // get surrounding hexagons
    const adjHexagons = state.hexAdjacentVertices.reduce((accm, adjVtces, index) => {
        if (adjVtces.indexOf(action.townVertex) > -1){
            return [...accm, index];
        } else {
            return accm;
        }
    }, []);

    adjHexagons.forEach(hexIdx => {
        const res = convertTerrainToResource(state.allHexagons[hexIdx].terrain)
        if (res) {
            currentResources[res] = currentResources[res] + 1;
        }
    });

    return {
        ...state,
        eventList: [...state.eventList, newEvent(action.type, currentColor, 'makes initial move 2')],
        playerResources: {
            ...state.playerResources,
            [currentColor] : currentResources
        },
        roads: [...state.roads, newRoad],
        towns: [...state.towns, newTown],
    };
};

export const distributeResources = (state: ICatanState, action: any) => {
    const dieRoll = action.dieRoll;
    const currentResources = state.playerResources;
    
    // get all hexes with matching dieRoll
    const matchingHexagons = state.allHexagons.reduce((accm, hex, index) => {
        if (hex.dieRoll === dieRoll){
            return [...accm, index];
        } else {
            return accm;
        }
    }, []);

    // for each hexagon, distribute resources to adjacent cities
    matchingHexagons.forEach(hexIdx => {
        const adjVtces = state.hexAdjacentVertices[hexIdx];
        const res = convertTerrainToResource(state.allHexagons[hexIdx].terrain);
        // for each vertex, get the town
        if (res){
            state.towns
            .filter(town => adjVtces.indexOf(town.vertex) > -1)
            .forEach(town => {
                currentResources[town.color][res] = currentResources[town.color][res] + (town.isCity ? 2 : 1)
            });
        }
    });

    return {
        ...state,
        eventList: [...state.eventList, newEvent(action.type, null, 'Distribute resources from die roll ' + dieRoll)],
        playerResources: currentResources,
        turnSubAction: state.turnSubAction + 1
    };
};

export const moveThief = (state: ICatanState, action: any) => {
    // TODO: check that the new thiefHex is different from the old one
    // TODO: check that target player has a town/city on newHex

    const currentResources = state.playerResources;
    const currentColor = getCurrentPlayerColor(state);
    // get random resource from
    if (action.targetPlayer){
        const targetResources: string[] = [];
        targetResources.fill('bricks', 0, currentResources[action.targetPlayer].bricks);
        targetResources.fill('lumber', targetResources.length, targetResources.length + currentResources[action.targetPlayer].bricks);
        targetResources.fill('ore', targetResources.length, targetResources.length + currentResources[action.targetPlayer].bricks);
        targetResources.fill('sheep', targetResources.length, targetResources.length + currentResources[action.targetPlayer].bricks);
        targetResources.fill('wheat', targetResources.length, targetResources.length + currentResources[action.targetPlayer].bricks);

        const randomIdx = Math.floor(Math.random() * (targetResources.length - 1));
        const randomTargetResource = targetResources[randomIdx];

        currentResources[action.targetPlayer][randomTargetResource] = currentResources[action.targetPlayer][randomTargetResource] - 1;
        currentResources[currentColor][randomTargetResource] = currentResources[currentColor][randomTargetResource] + 1;
    }

    return {
        ...state,
        eventList: [...state.eventList, newEvent(action.type, currentColor, 'moves thief')],
        playerResources: currentResources,
        thiefHex: action.newHex,
        turnSubAction: state.turnSubAction + 1
    };
};

export const discardHalfResources = (state: ICatanState, action: any) => {
    return state;
}