import { useEffect, useState } from 'react';
import { ELEMENT_STYLE_CHANGE_EVENT } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { parseTrackList, toPx } from '../utils/grid-outline-utils';

export type GridTracks = {
	columns: number[];
	rows: number[];
	columnGap: number;
	rowGap: number;
	padding: { top: number; right: number; bottom: number; left: number };
	borderColor: string;
};

const EMPTY: GridTracks = {
	columns: [],
	rows: [],
	columnGap: 0,
	rowGap: 0,
	padding: { top: 0, right: 0, bottom: 0, left: 0 },
	borderColor: '',
};

const DEVICE_MODE_CHANGE_EVENT = 'elementor/device-mode/change';

export function useGridTracks( element: HTMLElement | null, rect: DOMRect ): GridTracks {
	const [ tracks, setTracks ] = useState< GridTracks >( EMPTY );

	const trigger = useListenTo(
		[ windowEvent( ELEMENT_STYLE_CHANGE_EVENT ), windowEvent( DEVICE_MODE_CHANGE_EVENT ) ],
		() => ( {} )
	);

	useEffect( () => {
		const previewWindow = element?.ownerDocument?.defaultView;

		if ( ! element || ! previewWindow ) {
			setTracks( EMPTY );
			return;
		}

		const frame = previewWindow.requestAnimationFrame( () => {
			setTracks( readGridTracks( previewWindow, element ) );
		} );

		return () => {
			previewWindow.cancelAnimationFrame( frame );
		};
	}, [ element, rect.width, rect.height, trigger ] );

	return tracks;
}

function readGridTracks( previewWindow: Window, element: HTMLElement ): GridTracks {
	const computedStyle = previewWindow.getComputedStyle( element );

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
