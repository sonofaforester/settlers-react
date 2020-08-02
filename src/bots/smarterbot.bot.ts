import { Color, ICatanState } from '../types';
import { ICatanBot } from '../types/bot';
import { Bot } from './bot';

export const createSmarterBot = (color: Color): ICatanBot => {
    return new SmarterBot(color)
}

class SmarterBot extends Bot {
    constructor(color: Color) {
        super(color)
    }

    public makeInitialMove1(state: ICatanState) {
        return this.basicInitialMove(state)
    }
    public makeInitialMove2(state: ICatanState) {
        return this.basicInitialMove(state)
    }

    public getBotName() {
        return 'Smarter Bot ' + this.savedRandomNum
    }

    protected sortTowns = (towns: number[], state: ICatanState): number[] => {
        const sortedTowns = towns.sort((a, b) => {
            if (state.vertexAdjacentHexes[a].find((h) => h.dieRoll === 7)) {
                return -1
            }

            if (state.vertexAdjacentHexes[b].find((h) => h.dieRoll === 7)) {
                return 1
            }

            let rollProbabilityA = 0
            state.vertexAdjacentHexes[a].forEach(
                (h) => (rollProbabilityA += 7 - Math.abs(7 - h.dieRoll))
            )

            let rollProbabilityB = 0
            state.vertexAdjacentHexes[b].forEach(
                (h) => (rollProbabilityB += 7 - Math.abs(7 - h.dieRoll))
            )

            return rollProbabilityA - rollProbabilityB
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
                    typeof state.roads.find((r) => r.edge === e) === 'undefined'
            )
        const randomRoadIdx = Math.floor(Math.random() * adjacentRoads.length)
        const roadEdge = adjacentRoads[randomRoadIdx]

        return {
            roadEdge,
            townVertex,
        }
    }

    protected buildTown(validTowns: number[], state: ICatanState) {
        const bestTown = this.sortTowns(validTowns, state).pop() as number
        return {
            targetVtx: bestTown,
            type: 'BUILD_TOWN',
        }
    }
}
