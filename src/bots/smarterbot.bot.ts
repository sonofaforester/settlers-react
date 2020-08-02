import { Color, ICatanState } from '../types';
import { ICatanBot } from '../types/bot';
import { Bot } from './bot';

/* BASIC BOT 
    - WILL make random (but valid moves)
    - if there are enough resources and valid spaces, will attempt to:
        1. upgrade city
        2. build town
        3. build road
    - if there are not enough resources to build with, will attempt to:
        1. make a bank trade for the most lacking resource

    - WILL NOT use dev cards or make player trades
*/

export const createSmarterBot = (color: Color): ICatanBot => {
    return new SmarterBot(color);
};

class SmarterBot extends Bot {
    constructor(color: Color) {
        super(color);
        
    }

    public makeInitialMove1 (state: ICatanState) {return this.basicInitialMove(state);}
    public makeInitialMove2 (state: ICatanState) {return this.basicInitialMove(state);}


    public getBotName () {
        return 'Smarter Bot ' + this.savedRandomNum;
    }

    protected basicInitialMove (state: ICatanState)  {
        const validTowns = this.getValidInitTownLocations(state, this.getOwnColor());
        const sortedTowns = validTowns.sort((a,b) => {
            if(state.vertexAdjacentHexes[a].find(h => h.dieRoll === 7))
                {return 1;}

            if(state.vertexAdjacentHexes[b].find(h => h.dieRoll === 7))
               { return -1;}

            let rollProbabilityA = 0; 
            state.vertexAdjacentHexes[a].forEach(h => rollProbabilityA += (7 - Math.abs(7 - h.dieRoll)));
            
            let rollProbabilityB = 0; 
            state.vertexAdjacentHexes[b].forEach(h => rollProbabilityB += (7 - Math.abs(7 - h.dieRoll)));

            return rollProbabilityB - rollProbabilityA;
        });
        const townVertex = sortedTowns[0];
        const adjacentRoads = state.allEdges
        .filter(e => e[0] === townVertex || e[1] === townVertex)
        .filter(e => typeof state.roads.find(r => r.edge === e) === 'undefined');
        const randomRoadIdx = Math.floor(Math.random() * adjacentRoads.length);
        const roadEdge = adjacentRoads[randomRoadIdx];

        return {
            roadEdge,
            townVertex
        };
    }
}