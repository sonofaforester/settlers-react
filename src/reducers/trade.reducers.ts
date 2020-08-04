import { ICatanState } from '../types';
import { getCurrentPlayerColor, modifyPlayerResources, newEvent } from '../utils/utils';
import { canAfford } from '../utils/verification';

export const offerTrade = (state: ICatanState, action: any) => {
    return state
}

export const acceptTrade = (state: ICatanState, action: any) => {
    return state
}

export const declineTrade = (state: ICatanState, action: any) => {
    return state
}

export const bankTrade = (state: ICatanState, action: any) => {
    const currentColor = getCurrentPlayerColor(state)
    const currentResources = state.players[currentColor].playerResources
    // TODO: implement port trading

    // verify that only 1 type of resource is exchanged from each side
    // in the correct amounts
    // and the resource types are different
    if (
        canAfford(currentResources, action.myResources) &&
        Object.entries(action.myResources).length === 1 &&
        Object.entries(action.myResources)[0][1] === -4 &&
        Object.entries(action.targetResources).length === 1 &&
        Object.entries(action.targetResources)[0][1] === 1 &&
        Object.entries(action.myResources)[0][0] !==
            Object.entries(action.targetResources)[0][0]
    ) {
        state.players[currentColor].playerResources = modifyPlayerResources(
            currentResources,
            {
                ...action.myResources,
                ...action.targetResources,
            }
        )
        return {
            ...state,
            eventList: [
                ...state.eventList,
                newEvent(action.type, currentColor, 'made a bank trade'),
            ],
            turnSubAction: state.turnSubAction + 1,
        }
    } else {
        return state
    }
}
