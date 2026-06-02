import * as React from 'react';

import { type GridTracks } from '../../hooks/use-grid-tracks';
import { computeGridLines, snapToHalfPixel } from '../../utils/grid-outline-utils';
import { GridOutlineLine } from './grid-outline-cell';

type Props = {
	tracks: GridTracks;
	width: number;
	height: number;
};

export function GridOutline( { tracks, width, height }: Props ) {
	const { vertical, horizontal } = computeGridLines( tracks, width, height );

	return (
		<svg
			width={ width }
			height={ height }
			style={ { position: 'absolute', inset: 0, overflow: 'visible' } }
			xmlns="http://www.w3.org/2000/svg"
		>
			{ vertical.map( ( line, i ) => (
				<GridOutlineLine
					key={ `v${ i }` }
					x1={ snapToHalfPixel( line.x1 ) }
					y1={ Math.round( line.y1 ) }
					x2={ snapToHalfPixel( line.x2 ) }
					y2={ Math.round( line.y2 ) }
					color={ tracks.borderColor }
				/>
			) ) }
			{ horizontal.map( ( line, i ) => (
				<GridOutlineLine
					key={ `h${ i }` }
					x1={ Math.round( line.x1 ) }
					y1={ snapToHalfPixel( line.y1 ) }
					x2={ Math.round( line.x2 ) }
					y2={ snapToHalfPixel( line.y2 ) }
					color={ tracks.borderColor }
				/>
			) ) }
		</svg>
	);
}
