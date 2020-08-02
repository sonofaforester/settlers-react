import { IVertex } from '../types';

export const hexAdjacentVertices: Array<[
    IVertex,
    IVertex,
    IVertex,
    IVertex,
    IVertex,
    IVertex
]> = [
    [0, 1, 2, 8, 9, 10],
    [2, 3, 4, 10, 11, 12],
    [4, 5, 6, 12, 13, 14],
    [7, 8, 9, 17, 18, 19],
    [9, 10, 11, 19, 20, 21],
    [11, 12, 13, 21, 22, 23],
    [13, 14, 15, 23, 24, 25],
    [16, 17, 18, 27, 28, 29],
    [18, 19, 20, 29, 30, 31],
    [20, 21, 22, 31, 32, 33],
    [22, 23, 24, 33, 34, 35],
    [24, 25, 26, 35, 36, 37],
    [28, 29, 30, 38, 39, 40],
    [30, 31, 32, 40, 41, 42],
    [32, 33, 34, 42, 43, 44],
    [34, 35, 36, 44, 45, 46],
    [39, 40, 41, 47, 48, 49],
    [41, 42, 43, 49, 50, 51],
    [43, 44, 45, 51, 52, 53],
]
