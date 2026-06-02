import { type GridTracks } from '../hooks/use-grid-tracks';

export type CellRect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

type TrackSegment = {
	start: number;
	size: number;
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

export function computeCellRects( tracks: GridTracks, width: number, height: number ): CellRect[] {
	const { columns, rows, columnGap, rowGap, padding } = tracks;

	const hasColumns = columns.length > 0;
	const hasRows = rows.length > 0;

	if ( ! hasColumns && ! hasRows ) {
		return [];
	}

	const columnSegments = hasColumns
		? computeTrackSegments( columns, columnGap, padding.left )
		: [ { start: padding.left, size: width - padding.left - padding.right } ];

	const rowSegments = hasRows
		? computeTrackSegments( rows, rowGap, padding.top )
		: [ { start: padding.top, size: height - padding.top - padding.bottom } ];

	const cells: CellRect[] = [];

	for ( const row of rowSegments ) {
		for ( const column of columnSegments ) {
			cells.push( { x: column.start, y: row.start, width: column.size, height: row.size } );
		}
	}

	return cells;
}

function computeTrackSegments( sizes: number[], gap: number, offset: number ): TrackSegment[] {
	const segments: TrackSegment[] = [];
	let cursor = offset;

	for ( let i = 0; i < sizes.length; i++ ) {
		segments.push( { start: cursor, size: sizes[ i ] } );
		cursor += sizes[ i ];

		if ( i < sizes.length - 1 ) {
			cursor += gap;
		}
	}

	return segments;
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
