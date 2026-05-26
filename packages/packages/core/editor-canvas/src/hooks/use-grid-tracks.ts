import { useMemo } from 'react';

export type GridTracks = {
	columns: number[];
	rows: number[];
	columnGap: number;
	rowGap: number;
	padding: { top: number; right: number; bottom: number; left: number };
};

const EMPTY: GridTracks = {
	columns: [],
	rows: [],
	columnGap: 0,
	rowGap: 0,
	padding: { top: 0, right: 0, bottom: 0, left: 0 },
};

export function useGridTracks( element: HTMLElement | null, rect: DOMRect ): GridTracks {
	return useMemo( () => {
		if ( ! element ) {
			return EMPTY;
		}

		const win = element.ownerDocument?.defaultView;

		if ( ! win ) {
			return EMPTY;
		}

		const cs = win.getComputedStyle( element );

		return {
			columns: parseTrackList( cs.gridTemplateColumns ),
			rows: parseTrackList( cs.gridTemplateRows ),
			columnGap: toPx( cs.columnGap ),
			rowGap: toPx( cs.rowGap ),
			padding: {
				top: toPx( cs.paddingTop ),
				right: toPx( cs.paddingRight ),
				bottom: toPx( cs.paddingBottom ),
				left: toPx( cs.paddingLeft ),
			},
		};
		// rect.width/height drive recomputation as the iframe layout changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ element, rect.width, rect.height ] );
}

function parseTrackList( value: string ): number[] {
	if ( ! value || value === 'none' ) {
		return [];
	}

	return value
		.trim()
		.split( /\s+/ )
		.map( toPx )
		.filter( ( n ) => n > 0 );
}

function toPx( value: string ): number {
	const n = parseFloat( value );

	return Number.isFinite( n ) ? n : 0;
}
