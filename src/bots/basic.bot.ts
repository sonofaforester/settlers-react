import { Color } from '../types';
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

export const createBasicBot = (color: Color): ICatanBot => {  
    return new Bot(color);
};