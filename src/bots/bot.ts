import { cityCost, roadCost, townCost } from '../constants';
import { Color, ICatanState, IPlayerResources, IRoad, ITown, IVertex } from '../types';
import { IDefaultAction } from '../types/actions';
import { ICatanBot } from '../types/bot';
import { random } from '../utils/utils';
import { canAfford, getValidRoadLocations, getValidTownLocations } from '../utils/verification';

export class Bot implements ICatanBot {
    public color: Color
    public playerResources: IPlayerResources = {
        bricks: 0,
        lumber: 0,
        ore: 0,
        sheep: 0,
        wheat: 0,
    } as IPlayerResources
    public roads: IRoad[]
    public towns: ITown[]
    protected savedRandomNum = random(1000)

    constructor(color: Color) {
        this.color = color
        this.roads = []
        this.towns = []
    }

    public makeInitialMove1(state: ICatanState) {
        return this.basicInitialMove(state)
    }
    public makeInitialMove2(state: ICatanState) {
        return this.basicInitialMove(state)
    }

    public acceptOrDeclineTrade(
        state: ICatanState,
        trade: any
    ): IDefaultAction {
        return {
            type: 'sdfdsf',
        }
    }

    public getBotName() {
        return 'Basic Bot ' + this.savedRandomNum
    }

    public makeTurn(state: ICatanState) {
        const resources = this.playerResources
        const canAffordCity = canAfford(resources, cityCost)
        const validCities = this.towns.filter((t) => !t.isCity)
        const canAffordTown = canAfford(resources, townCost)
        const validTowns = getValidTownLocations(state, this.getOwnColor())
        const canAffordRoad = canAfford(resources, roadCost)
        const validRoads = getValidRoadLocations(state, this.getOwnColor())
        const hasGT5ofResource =
            resources.bricks >= 5 ||
            resources.lumber >= 5 ||
            resources.ore >= 5 ||
            resources.sheep >= 5 ||
            resources.wheat >= 5
        const hasLT5ofResource =
            resources.bricks < 5 ||
            resources.lumber < 5 ||
            resources.ore < 5 ||
            resources.sheep < 5 ||
            resources.wheat < 5

        // if there are enough resources, upgrade a town to a city
        if (canAffordCity && validCities.length > 0) {
            return this.buildCity(validCities, state)
            // if there are enough resources, build a town
        } else if (canAffordTown && validTowns.length > 0) {
            return this.buildTown(validTowns, state)
            // if there are enough resources, build a road
        } else if (canAffordRoad && validRoads.length > 0) {
            const randomRoadIdx = random(validRoads.length)
            return {
                targetEdge: validRoads[randomRoadIdx],
                type: 'BUILD_ROAD',
            }
            // if there is too many of 1 type of resource, make a bank trade
        } else if (hasGT5ofResource && hasLT5ofResource) {
            // TODO: is it possible for maxResource === minResource?
            const maxResource = Object.entries(resources).filter(
                (r) => r[1] >= 5
            )[0][0]
            const minResource = Object.entries(resources).reduce(
                (accm, r) => {
                    if (accm[1] <= r[1]) {
                        return accm
                    } else {
                        return r
                    }
                },
                ['', 5]
            )[0]

            return {
                myResources: {
                    [maxResource]: -4,
                },
                targetResources: {
                    [minResource]: 1,
                },
                type: 'BANK_TRADE',
            }
            // if there are not enough resources, end turn
        } else {
            return {
                type: 'END_PLAYER_TURN',
            }
        }
    }

    protected getOwnColor(): Color {
        return this.color
    }

    // return array of valid town locations for player color
    protected getValidInitTownLocations(
        state: ICatanState,
        playerColor: Color
    ): IVertex[] {
        const validTownLocations: IVertex[] = []
        for (let i = 0; i < state.totalVertices; i++) {
            const tempTown = {
                color: playerColor,
                isCity: false,
                isPort: false,
                vertex: i,
            }
            if (this.isValidInitTownLocation(state, tempTown)) {
                validTownLocations.push(i)
            }
        }
        return validTownLocations
    }

    protected sortTowns = (towns: number[], state: ICatanState): number[] => {
        const sortedTowns = towns.sort((a, b) => {
            return Math.floor(Math.random() * 3) - 1
        })

        return sortedTowns
    }

    protected basicInitialMove(state: ICatanState) {
        const validTowns = this.getValidInitTownLocations(
            state,
            this.getOwnColor()
        )
        const sortedTowns = this.sortTowns(validTowns, state)
        const townVertex = sortedTowns.pop() as number
        const adjacentRoads = state.allEdges
            .filter((e) => e[0] === townVertex || e[1] === townVertex)
            .filter(
                (e) =>
                    typeof state.roads().find((r) => r.edge === e) ===
                    'undefined'
            )
        const randomRoadIdx = Math.floor(Math.random() * adjacentRoads.length)
        const roadEdge = adjacentRoads[randomRoadIdx]

        return {
            roadEdge,
            townVertex,
        }
    }

    protected buildCity(validCities: ITown[], state: ICatanState) {
        const randomCityIdx = random(validCities.length)
        return {
            targetVtx: validCities[randomCityIdx].vertex,
            type: 'UPGRADE_TOWN',
        }
    }

    protected buildTown(validTowns: number[], state: ICatanState) {
        const bestTown = this.sortTowns(validTowns, state).pop() as number
        return {
            targetVtx: bestTown,
            type: 'BUILD_TOWN',
        }
    }

    private isValidInitTownLocation(
        state: ICatanState,
        newTown: ITown
    ): boolean {
        const vertex = newTown.vertex

        // there must not be another town here
        const hasExistingTown =
            typeof state.towns().find((t) => t.vertex === vertex) !==
            'undefined'
        // there must not be an adjacent town
        const adjacentVertices = state.allEdges
            .filter((e) => e[0] === vertex || e[1] === vertex)
            .map((e) => (e[0] === vertex ? e[1] : e[0]))
        const hasAdjacentTowns =
            state.towns().filter((t) => adjacentVertices.includes(t.vertex))
                .length > 0

        return !hasExistingTown && !hasAdjacentTowns
    }

    // #endregion Private Methods (4)
}
