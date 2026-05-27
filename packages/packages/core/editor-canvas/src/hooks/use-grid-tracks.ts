import { useMemo } from 'react';

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

export function useGridTracks( element: HTMLElement | null, rect: DOMRect ): GridTracks {
	return useMemo( () => {
		if ( ! element ) {
			return EMPTY;
		}

		const previewWindow = element.ownerDocument?.defaultView;

		if ( ! previewWindow ) {
			return EMPTY;
		}

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ element, rect.width, rect.height ] );
}
