import * as React from 'react';

import { type GridTracks } from '../../hooks/use-grid-tracks';
import { computeOutlineGeometry, snapToHalfPixel } from '../../utils/grid-outline-utils';
import { GridOutlineLine } from './grid-outline-line';

type Props = {
	tracks: GridTracks;
	width: number;
	height: number;
};

export function GridOutline( { tracks, width, height }: Props ) {
	const { vertical, horizontal, top, bottom, left, right } = computeOutlineGeometry( tracks, width, height );

	return (
		<svg
			width={ width }
			height={ height }
			style={ { position: 'absolute', inset: 0, overflow: 'visible' } }
			xmlns="http://www.w3.org/2000/svg"
		>
			{ vertical.map( ( x, i ) => (
				<GridOutlineLine
					key={ `v-${ i }` }
					x1={ snapToHalfPixel( x ) }
					x2={ snapToHalfPixel( x ) }
					y1={ top }
					y2={ bottom }
					color={ tracks.borderColor }
				/>
			) ) }
			{ horizontal.map( ( y, i ) => (
				<GridOutlineLine
					key={ `h-${ i }` }
					x1={ left }
					x2={ right }
					y1={ snapToHalfPixel( y ) }
					y2={ snapToHalfPixel( y ) }
					color={ tracks.borderColor }
				/>
			) ) }
		</svg>
	);
}
