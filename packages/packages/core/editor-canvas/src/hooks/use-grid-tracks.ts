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

function parsePx( value: string | undefined ): number {
	if ( ! value ) {
		return 0;
	}
	const parsed = parseFloat( value );
	return Number.isFinite( parsed ) ? parsed : 0;
}

function parseTrackList( value: string | undefined ): number[] {
	if ( ! value || value === 'none' ) {
		return [];
	}
	return value
		.split( ' ' )
		.map( parsePx )
		.filter( ( px ) => px > 0 );
}

function inferImplicitRowSizes( element: HTMLElement, autoRowSize: number ): number[] {
	const sizes: number[] = [];
	const children = Array.from( element.children ) as HTMLElement[];
	for ( const child of children ) {
		if ( ! child.isConnected ) {
			continue;
		}
		const cs = getComputedStyle( child );
		if ( cs.display === 'none' ) {
			continue;
		}
		const height = child.getBoundingClientRect().height;
		sizes.push( height > 0 ? height : autoRowSize );
	}
	return sizes;
}

export function useGridTracks( element: HTMLElement | null, rect: DOMRect ): GridTracks {
	return useMemo( () => {
		if ( ! element || ! element.ownerDocument?.defaultView ) {
			return EMPTY;
		}
		const cs = element.ownerDocument.defaultView.getComputedStyle( element );

		const padding = {
			top: parsePx( cs.paddingTop ),
			right: parsePx( cs.paddingRight ),
			bottom: parsePx( cs.paddingBottom ),
			left: parsePx( cs.paddingLeft ),
		};
		const columnGap = parsePx( cs.columnGap );
		const rowGap = parsePx( cs.rowGap );

		let columns = parseTrackList( cs.gridTemplateColumns );
		let rows = parseTrackList( cs.gridTemplateRows );

		const contentWidth = Math.max( 0, rect.width - padding.left - padding.right );
		const contentHeight = Math.max( 0, rect.height - padding.top - padding.bottom );

		if ( columns.length === 0 && contentWidth > 0 ) {
			columns = [ contentWidth ];
		}

		if ( rows.length === 0 && contentHeight > 0 ) {
			const autoRow = parsePx( cs.gridAutoRows ) || contentHeight;
			const inferred = inferImplicitRowSizes( element, autoRow );
			rows = inferred.length > 0 ? inferred : [ contentHeight ];
		}

		return { columns, rows, columnGap, rowGap, padding };
	}, [ element, rect.width, rect.height ] );
}
