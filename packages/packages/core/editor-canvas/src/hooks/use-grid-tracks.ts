export type GridTracks = {
	target: HTMLElement;
	columns: number[];
	rows: number[];
	columnGap: number;
	rowGap: number;
	padding: { top: number; right: number; bottom: number; left: number };
	offsetX: number;
	offsetY: number;
};

export function readGridTracks( element: HTMLElement ): GridTracks | null {
	const target = findGridTarget( element );

	if ( ! target ) {
		return null;
	}

	const cs = element.ownerDocument?.defaultView?.getComputedStyle( target );

	if ( ! cs ) {
		return null;
	}

	const columns = parseTrackList( cs.gridTemplateColumns );
	const rows = parseTrackList( cs.gridTemplateRows );

	if ( ! columns.length || ! rows.length ) {
		return null;
	}

	const elementRect = element.getBoundingClientRect();
	const targetRect = target.getBoundingClientRect();

	return {
		target,
		columns,
		rows,
		columnGap: parseSize( cs.columnGap ),
		rowGap: parseSize( cs.rowGap ),
		padding: {
			top: parseSize( cs.paddingTop ),
			right: parseSize( cs.paddingRight ),
			bottom: parseSize( cs.paddingBottom ),
			left: parseSize( cs.paddingLeft ),
		},
		offsetX: targetRect.left - elementRect.left,
		offsetY: targetRect.top - elementRect.top,
	};
}

function findGridTarget( element: HTMLElement ): HTMLElement | null {
	const win = element.ownerDocument?.defaultView;

	if ( ! win ) {
		return null;
	}

	if ( win.getComputedStyle( element ).display === 'grid' ) {
		return element;
	}

	const candidates = element.querySelectorAll< HTMLElement >( ':scope > *' );

	for ( const candidate of Array.from( candidates ) ) {
		if ( win.getComputedStyle( candidate ).display === 'grid' ) {
			return candidate;
		}
	}

	return null;
}

function parseTrackList( value: string ): number[] {
	if ( ! value || value === 'none' ) {
		return [];
	}

	return value
		.split( ' ' )
		.map( ( part ) => parseFloat( part ) )
		.filter( ( n ) => Number.isFinite( n ) && n > 0 );
}

function parseSize( value: string ): number {
	const n = parseFloat( value );
	return Number.isFinite( n ) ? n : 0;
}
