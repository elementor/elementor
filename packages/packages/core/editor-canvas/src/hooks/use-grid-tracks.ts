import { useEffect, useState } from 'react';
import { throttle } from '@elementor/utils';

import type { GridTracks } from '../utils/grid-gradient';

const EMPTY: GridTracks = { columns: [], rows: [], columnGap: 0, rowGap: 0, width: 0, height: 0 };

export function useGridTracks( element: HTMLElement | null ): GridTracks {
	const [ tracks, setTracks ] = useState< GridTracks >( EMPTY );

	useEffect( () => {
		if ( ! element ) {
			setTracks( EMPTY );
			return;
		}

		const read = throttle(
			() => {
				const style = element.ownerDocument?.defaultView?.getComputedStyle( element );

				if ( ! style ) {
					return;
				}

				if ( style.display !== 'grid' && style.display !== 'inline-grid' ) {
					setTracks( EMPTY );
					return;
				}

				setTracks( {
					columns: parseTrackList( style.gridTemplateColumns ),
					rows: parseTrackList( style.gridTemplateRows ),
					columnGap: parsePx( style.columnGap ),
					rowGap: parsePx( style.rowGap ),
					width: element.clientWidth,
					height: element.clientHeight,
				} );
			},
			20,
			true
		);

		read();

		const resizeObserver = new ResizeObserver( read );
		resizeObserver.observe( element );

		const mutationObserver = new MutationObserver( read );
		mutationObserver.observe( element, {
			attributes: true,
			attributeFilter: [ 'style', 'class' ],
			childList: true,
			subtree: true,
		} );

		return () => {
			read.cancel();
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		};
	}, [ element ] );

	return tracks;
}

function parseTrackList( value: string ): number[] {
	if ( ! value || value === 'none' ) {
		return [];
	}

	return value
		.split( ' ' )
		.map( ( token ) => parseFloat( token ) )
		.filter( ( n ) => Number.isFinite( n ) && n > 0 );
}

function parsePx( value: string ): number {
	const n = parseFloat( value );
	return Number.isFinite( n ) ? n : 0;
}
