type Axis = 'columns' | 'rows';

const LINE_THICKNESS = 1;
const DASH_LENGTH = 6;
const DASH_GAP = 4;

export type GridTracks = {
	columns: number[];
	rows: number[];
	columnGap: number;
	rowGap: number;
	width: number;
	height: number;
};

export function buildAxisLineGradient(
	axis: Axis,
	{ columns, rows, columnGap, rowGap, width, height }: GridTracks,
	color: string
): string {
	const isColumns = axis === 'columns';
	const tracks = isColumns ? columns : rows;
	const gap = isColumns ? columnGap : rowGap;
	const total = isColumns ? width : height;

	if ( tracks.length === 0 || total <= 0 ) {
		return 'none';
	}

	const boundaries: number[] = [];
	let offset = 0;
	boundaries.push( 0 );

	tracks.forEach( ( size, index ) => {
		offset += size;
		boundaries.push( offset );

		if ( gap > 0 && index < tracks.length - 1 ) {
			offset += gap;
			boundaries.push( offset );
		}
	} );

	const direction = isColumns ? 'to right' : 'to bottom';
	const stops: string[] = [];
	let cursor = 0;

	boundaries.forEach( ( pos ) => {
		const lineStart = Math.max( 0, pos === total ? pos - LINE_THICKNESS : pos );
		const lineEnd = Math.min( total, lineStart + LINE_THICKNESS );

		if ( lineStart > cursor ) {
			stops.push( `transparent ${ cursor }px`, `transparent ${ lineStart }px` );
		}
		stops.push( `${ color } ${ lineStart }px`, `${ color } ${ lineEnd }px` );
		cursor = lineEnd;
	} );

	if ( cursor < total ) {
		stops.push( `transparent ${ cursor }px`, `transparent ${ total }px` );
	}

	return `linear-gradient(${ direction }, ${ stops.join( ', ' ) })`;
}

export function buildAxisDashMask( axis: Axis ): string {
	const direction = axis === 'columns' ? 'to bottom' : 'to right';
	const period = DASH_LENGTH + DASH_GAP;

	return `repeating-linear-gradient(${ direction }, #000 0 ${ DASH_LENGTH }px, transparent ${ DASH_LENGTH }px ${ period }px)`;
}
