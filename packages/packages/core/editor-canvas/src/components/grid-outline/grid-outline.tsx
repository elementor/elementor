import * as React from 'react';

import { type GridTracks } from '../../hooks/use-grid-tracks';
import { computeBoundaries, snapToHalfPixel } from '../../utils/grid-outline-utils';
import { GridOutlineLine } from './grid-outline-line';

type Props = {
	tracks: GridTracks;
	width: number;
	height: number;
};

export function GridOutline( { tracks, width, height }: Props ) {
	const { columns, rows, columnGap, rowGap, padding } = tracks;

	const verticalLines = computeBoundaries( columns, columnGap, padding.left );
	const horizontalLines = computeBoundaries( rows, rowGap, padding.top );

	const contentLeft = padding.left;
	const contentRight = width - padding.right;
	const contentTop = padding.top;
	const contentBottom = height - padding.bottom;

	return (
		<svg
			width={ width }
			height={ height }
			style={ { position: 'absolute', inset: 0, overflow: 'visible' } }
			xmlns="http://www.w3.org/2000/svg"
		>
			{ verticalLines.map( ( x, i ) => (
				<GridOutlineLine
					key={ `v-${ i }` }
					x1={ snapToHalfPixel( x ) }
					x2={ snapToHalfPixel( x ) }
					y1={ contentTop }
					y2={ contentBottom }
				/>
			) ) }
			{ horizontalLines.map( ( y, i ) => (
				<GridOutlineLine
					key={ `h-${ i }` }
					x1={ contentLeft }
					x2={ contentRight }
					y1={ snapToHalfPixel( y ) }
					y2={ snapToHalfPixel( y ) }
				/>
			) ) }
		</svg>
	);
}
