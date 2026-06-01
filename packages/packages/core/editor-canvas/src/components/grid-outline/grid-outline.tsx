import * as React from 'react';

import { type GridTracks } from '../../hooks/use-grid-tracks';
import { computeCellRects, snapToHalfPixel } from '../../utils/grid-outline-utils';
import { GridOutlineCell } from './grid-outline-cell';

type Props = {
	tracks: GridTracks;
	width: number;
	height: number;
};

export function GridOutline( { tracks, width, height }: Props ) {
	const cells = computeCellRects( tracks, width, height );

	return (
		<svg
			width={ width }
			height={ height }
			style={ { position: 'absolute', inset: 0, overflow: 'visible' } }
			xmlns="http://www.w3.org/2000/svg"
		>
			{ cells.map( ( cell, i ) => (
				<GridOutlineCell
					key={ i }
					x={ snapToHalfPixel( cell.x ) }
					y={ snapToHalfPixel( cell.y ) }
					width={ Math.round( cell.width ) }
					height={ Math.round( cell.height ) }
					color={ tracks.borderColor }
				/>
			) ) }
		</svg>
	);
}
