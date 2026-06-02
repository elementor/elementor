import * as React from 'react';

import { type GridTracks } from '../../hooks/use-grid-tracks';
import { computeCellRects, computeGridLines, snapToHalfPixel } from '../../utils/grid-outline-utils';
import { Cell } from './cell';
import { Line } from './line';

type Props = {
	tracks: GridTracks;
	width: number;
	height: number;
};

const renderCells = ( tracks: GridTracks, width: number, height: number ) =>
	computeCellRects( tracks, width, height ).map( ( cell, i ) => (
		<Cell
			key={ i }
			x={ snapToHalfPixel( cell.x ) }
			y={ snapToHalfPixel( cell.y ) }
			width={ Math.round( cell.width ) }
			height={ Math.round( cell.height ) }
			color={ tracks.borderColor }
		/>
	) );

const renderLines = ( tracks: GridTracks, width: number, height: number ) => {
	const { vertical, horizontal } = computeGridLines( tracks, width, height );

	return [
		...vertical.map( ( line, i ) => (
			<Line
				key={ `v${ i }` }
				x1={ snapToHalfPixel( line.x1 ) }
				y1={ Math.round( line.y1 ) }
				x2={ snapToHalfPixel( line.x2 ) }
				y2={ Math.round( line.y2 ) }
				color={ tracks.borderColor }
			/>
		) ),
		...horizontal.map( ( line, i ) => (
			<Line
				key={ `h${ i }` }
				x1={ Math.round( line.x1 ) }
				y1={ snapToHalfPixel( line.y1 ) }
				x2={ Math.round( line.x2 ) }
				y2={ snapToHalfPixel( line.y2 ) }
				color={ tracks.borderColor }
			/>
		) ),
	];
};

export function GridOutline( { tracks, width, height }: Props ) {
	const hasGap = tracks.columnGap > 0 || tracks.rowGap > 0;

	return (
		<svg
			width={ width }
			height={ height }
			style={ { position: 'absolute', inset: 0, overflow: 'visible' } }
			xmlns="http://www.w3.org/2000/svg"
		>
			{ hasGap ? renderCells( tracks, width, height ) : renderLines( tracks, width, height ) }
		</svg>
	);
}
