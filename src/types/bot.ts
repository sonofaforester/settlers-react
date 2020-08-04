import {
    IBuildRoadAction, IBuildTownAction, IDefaultAction, IDiscardResourcesAction, IOfferTradeAction,
    IPlayKnightAction, IThiefAction
} from '../types/actions';
import { Color, ICatanState, IEdge, IPlayerResources, IRoad, ITown } from './';

export type IBotMakeTurnAction =
    | IDefaultAction
    | IBuildRoadAction
    | IBuildTownAction
    | IPlayKnightAction
    | IOfferTradeAction

// any bot must implement this interface
export interface ICatanBot {
    color: Color
    roads: IRoad[]
    towns: ITown[]
    getBotName: () => string
    makeInitialMove1: (
        state: ICatanState
    ) => { townVertex: number; roadEdge: IEdge }
    makeInitialMove2: (
        state: ICatanState
    ) => { townVertex: number; roadEdge: IEdge }
    makeTurn: (state: ICatanState) => IBotMakeTurnAction
    acceptOrDeclineTrade: (state: ICatanState, trade: any) => IDefaultAction
    discardResources?: (state: ICatanState) => IDiscardResourcesAction
    moveThief?: (state: ICatanState) => IThiefAction
    playerResources: IPlayerResources
}
