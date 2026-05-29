import { type GridTracks } from '../hooks/use-grid-tracks';

export type OutlineGeometry = {
	vertical: number[];
	horizontal: number[];
	top: number;
	bottom: number;
	left: number;
	right: number;
};

export function toGridTracks( computedStyle: CSSStyleDeclaration ): GridTracks {
	return {
		columns: parseTrackList( computedStyle.gridTemplateColumns ),
		rows: parseTrackList( computedStyle.gridTemplateRows ),
		columnGap: toPx( computedStyle.columnGap ),
		rowGap: toPx( computedStyle.rowGap ),
		padding: {
			top: toPx( computedStyle.paddingTop ),
			right: toPx( computedStyle.paddingRight ),
			bottom: toPx( computedStyle.paddingBottom ),
			left: toPx( computedStyle.paddingLeft ),
		},
		borderColor: computedStyle.getPropertyValue( '--e-a-border-color-bold' ).trim(),
	};
}

export function computeOutlineGeometry( tracks: GridTracks, width: number, height: number ): OutlineGeometry {
	const { columns, rows, columnGap, rowGap, padding } = tracks;

	return {
		vertical: computeBoundaries( columns, columnGap, padding.left ),
		horizontal: computeBoundaries( rows, rowGap, padding.top ),
		top: padding.top,
		bottom: height - padding.bottom,
		left: padding.left,
		right: width - padding.right,
	};
}

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

export function snapToHalfPixel( value: number ): number {
	return Math.round( value ) + 0.5;
}

export function parseTrackList( value: string ): number[] {
	if ( ! value || value === 'none' ) {
		return [];
	}

	return value
		.trim()
		.split( /\s+/ )
		.map( toPx )
		.filter( ( n ) => n > 0 );
}

export function toPx( value: string ): number {
	const parsed = parseFloat( value );

	return Number.isFinite( parsed ) ? parsed : 0;
}
