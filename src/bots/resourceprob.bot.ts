import { dieProbability } from '../constants';
import { Color, ICatanState } from '../types';
import { ICatanBot } from '../types/bot';
import { SmarterBot } from './smarterbot.bot';

export const createResourceProbBot = (color: Color): ICatanBot => {
    return new ResourceProbBot(color)
}

class ResourceProbBot extends SmarterBot {
    constructor(color: Color) {
        super(color)
    }

    public getBotName() {
        return 'Resource Bot ' + this.savedRandomNum
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
                (h) => (rollProbabilityA += dieProbability[h.dieRoll])
            )

            let rollProbabilityB = 0
            state.vertexAdjacentHexes[b].forEach(
                (h) => (rollProbabilityB += dieProbability[h.dieRoll])
            )

            return rollProbabilityA - rollProbabilityB
        })

        return sortedTowns
    }
}
