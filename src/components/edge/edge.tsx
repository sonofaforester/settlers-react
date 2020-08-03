import './edge.css';

import * as React from 'react';

import { Color, IVertex } from '../../types';

interface IEdgeProps {
    start: IVertex
    end: IVertex
    color: Color
}

function Edge(props: IEdgeProps) {
    return (
        <div
            className={
                'edge edge-' +
                props.start +
                '-' +
                props.end +
                ' ' +
                Color[props.color]
            }
        />
    )
}

export default Edge
