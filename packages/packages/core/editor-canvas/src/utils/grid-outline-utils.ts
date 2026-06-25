import { type GridTracks } from '../hooks/use-grid-tracks';

export type CellRect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type GridLine = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

export type GridLines = {
	vertical: GridLine[];
	horizontal: GridLine[];
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

export function computeGridLines( tracks: GridTracks, width: number, height: number ): GridLines {
	const { columns, rows, columnGap, rowGap, padding } = tracks;

	const hasColumns = columns.length > 0;
	const hasRows = rows.length > 0;

	if ( ! hasColumns && ! hasRows ) {
		return { vertical: [], horizontal: [] };
	}

	const columnSegments = hasColumns
		? computeTrackSegments( columns, columnGap, padding.left )
		: [ { start: padding.left, size: width - padding.left - padding.right } ];

	const rowSegments = hasRows
		? computeTrackSegments( rows, rowGap, padding.top )
		: [ { start: padding.top, size: height - padding.top - padding.bottom } ];

	const xs = uniqueSorted( columnSegments.flatMap( ( s ) => [ s.start, s.start + s.size ] ) );
	const ys = uniqueSorted( rowSegments.flatMap( ( s ) => [ s.start, s.start + s.size ] ) );

	const yTop = ys[ 0 ];
	const yBottom = ys[ ys.length - 1 ];
	const xLeft = xs[ 0 ];
	const xRight = xs[ xs.length - 1 ];

	return {
		vertical: xs.map( ( x ) => ( { x1: x, y1: yTop, x2: x, y2: yBottom } ) ),
		horizontal: ys.map( ( y ) => ( { x1: xLeft, y1: y, x2: xRight, y2: y } ) ),
	};
}

function uniqueSorted( values: number[] ): number[] {
	return Array.from( new Set( values ) ).sort( ( a, b ) => a - b );
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
