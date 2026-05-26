import * as React from 'react';
import { Box } from '@elementor/ui';
import { FloatingPortal } from '@floating-ui/react';

import { useElementRect } from '../hooks/use-element-rect';
import { useElementSetting } from '../hooks/use-element-setting';
import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import { type GridTracks, useGridTracks } from '../hooks/use-grid-tracks';
import type { ElementOverlayProps } from '../types/element-overlay';
import { CANVAS_WRAPPER_ID } from './outline-overlay';

const STROKE_COLOR = 'var(--e-a-border-color-bold, rgba(0, 0, 0, 0.12))';
const DASH = '4 4';

export const GridOutlineOverlay = ( { element, id, isSelected }: ElementOverlayProps ): React.ReactElement | null => {
	const enabled = useElementSetting< boolean >( id, 'grid_outline' );
	const rect = useElementRect( element );
	const tracks = useGridTracks( element, rect );
	const { isVisible, floating } = useFloatingOnElement( { element, isSelected } );

	if ( ! isSelected || enabled === false || ! isVisible ) {
		return null;
	}

	if ( tracks.columns.length === 0 && tracks.rows.length === 0 ) {
		return null;
	}

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<Box
				ref={ floating.setRef }
				style={ { ...floating.styles, pointerEvents: 'none' } }
				data-grid-outline={ id }
				role="presentation"
			>
				<GridOutlineSvg tracks={ tracks } width={ rect.width } height={ rect.height } />
			</Box>
		</FloatingPortal>
	);
};

type SvgProps = {
	tracks: GridTracks;
	width: number;
	height: number;
};

function GridOutlineSvg( { tracks, width, height }: SvgProps ) {
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
				<line
					key={ `v-${ i }` }
					x1={ snap( x ) }
					x2={ snap( x ) }
					y1={ contentTop }
					y2={ contentBottom }
					stroke={ STROKE_COLOR }
					strokeWidth={ 1 }
					strokeDasharray={ DASH }
					vectorEffect="non-scaling-stroke"
				/>
			) ) }
			{ horizontalLines.map( ( y, i ) => (
				<line
					key={ `h-${ i }` }
					x1={ contentLeft }
					x2={ contentRight }
					y1={ snap( y ) }
					y2={ snap( y ) }
					stroke={ STROKE_COLOR }
					strokeWidth={ 1 }
					strokeDasharray={ DASH }
					vectorEffect="non-scaling-stroke"
				/>
			) ) }
		</svg>
	);
}

// Returns the set of dashed-line positions: both edges of every gap (and outer
// boundaries of the track grid). N tracks → at most 2N boundaries.
function computeBoundaries( sizes: number[], gap: number, offset: number ): number[] {
	if ( sizes.length === 0 ) {
		return [];
	}

	const boundaries: number[] = [];
	let cursor = offset;

	for ( let i = 0; i < sizes.length; i++ ) {
		if ( i === 0 ) {
			boundaries.push( cursor );
		}

		cursor += sizes[ i ];
		boundaries.push( cursor );

		if ( i < sizes.length - 1 && gap > 0 ) {
			cursor += gap;
			boundaries.push( cursor );
		}
	}

	return boundaries;
}

function snap( value: number ): number {
	return Math.round( value ) + 0.5;
}
