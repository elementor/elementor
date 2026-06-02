import { useEffect, useState } from 'react';
import { ELEMENT_STYLE_CHANGE_EVENT } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { toGridTracks } from '../utils/grid-outline-utils';
import { useGridChildrenSignal } from './use-grid-children-signal';

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
	const childrenSignal = useGridChildrenSignal( element );

	useEffect( () => {
		const previewWindow = element?.ownerDocument?.defaultView;

		if ( ! element || ! previewWindow ) {
			setTracks( EMPTY );
			return;
		}

		const frame = previewWindow.requestAnimationFrame( () => {
			setTracks( toGridTracks( previewWindow.getComputedStyle( element ) ) );
		} );

		return () => {
			previewWindow.cancelAnimationFrame( frame );
		};
	}, [ element, rect.width, rect.height, trigger, childrenSignal ] );

	return tracks;
}
