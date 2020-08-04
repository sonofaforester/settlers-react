import { cityCost, devCardCost, roadCost, townCost } from '../constants';
import { ICatanState, IRoad, ITown } from '../types';
import {
    getCurrentPlayer, getCurrentPlayerColor, modifyPlayerResources, newEvent
} from '../utils/utils';
import {
    canAfford, isValidCityLocation, isValidRoadLocation, isValidTownLocation
} from '../utils/verification';

export const buildRoad = (state: ICatanState, action: any) => {
    const currentPlayer = getCurrentPlayer(state)
    const currentResources = currentPlayer.playerResources

    const newRoad: IRoad = {
        color: currentPlayer.color,
        edge: action.targetEdge,
    }

    if (
        canAfford(currentResources, roadCost) &&
        isValidRoadLocation(state, newRoad)
    ) {
        // TODO: check that player still has road pieces
        // TODO: calculate longest road
        currentPlayer.playerResources = modifyPlayerResources(
            currentResources,
            roadCost
        )

        currentPlayer.roads.push(newRoad)

        return {
            ...state,
            eventList: [
                ...state.eventList,
                newEvent(
                    action.type,
                    currentPlayer.color,
                    'built a road',
                    'at edge [' + action.targetEdge.toString() + ']'
                ),
            ],
            turnSubAction: state.turnSubAction + 1,
        }
    } else {
        return state
    }
}

export const buildTown = (state: ICatanState, action: any) => {
    // TODO: check that this town location is valid
    // TODO: check that player has enough resources
    // TODO: calculate longest road

    const currentPlayer = getCurrentPlayer(state)
    const currentResources = currentPlayer.playerResources

    const newTown: ITown = {
        color: currentPlayer.color,
        isCity: false,
        isPort: false,
        vertex: action.targetVtx,
    }

    if (
        canAfford(currentResources, townCost) &&
        isValidTownLocation(state, newTown)
    ) {
        currentPlayer.playerResources = modifyPlayerResources(
            currentResources,
            townCost
        )

        currentPlayer.towns.push(newTown)

        return {
            ...state,
            eventList: [
                ...state.eventList,
                newEvent(
                    action.type,
                    currentPlayer.color,
                    'built a town',
                    'at vertex ' + action.targetVtx
                ),
            ],
            turnSubAction: state.turnSubAction + 1,
        }
    } else {
        return state
    }
}

export const upgradeTown = (state: ICatanState, action: any) => {
    const currentPlayer = getCurrentPlayer(state)
    const currentResources = currentPlayer.playerResources

    if (
        canAfford(currentResources, cityCost) &&
        isValidCityLocation(state, currentPlayer.color, action.targetVtx)
    ) {
        const targetTown = currentPlayer.towns.find(
            (town) => town.vertex === action.targetVtx
        )
        if (targetTown) {
            targetTown.isCity = true
        }

        currentPlayer.playerResources = modifyPlayerResources(
            currentResources,
            cityCost
        )

        return {
            ...state,
            eventList: [
                ...state.eventList,
                newEvent(
                    action.type,
                    currentPlayer.color,
                    'upgraded a town to a city',
                    'at vertex ' + action.targetVtx
                ),
            ],
            turnSubAction: state.turnSubAction + 1,
        }
    } else {
        return state
    }
}

export const buildDevCard = (state: ICatanState, action: any) => {
    const currentColor = getCurrentPlayerColor(state)
    const currentResources = state.players[currentColor].playerResources

    if (canAfford(currentResources, devCardCost)) {
        // get random unselected card
        const randomCard = state.cards[0]
        randomCard.color = currentColor
        randomCard.wasPlayed = false
        randomCard.turn = state.turn

        state.players[currentColor].playerResources = modifyPlayerResources(
            currentResources,
            devCardCost
        )

        return {
            ...state,
            cards: [...state.cards],
            eventList: [
                ...state.eventList,
                newEvent(action.type, currentColor, 'built a dev card'),
            ],
            turnSubAction: state.turnSubAction + 1,
        }
    } else {
        return state
    }
}
