import { useEffect } from 'react';

import { useElementRect } from '../../hooks/use-element-rect';
import { useGridTracks } from '../../hooks/use-grid-tracks';
import type { ElementOverlayProps } from '../../types/element-overlay';
import { findFirstEmptyCell } from '../../utils/find-first-empty-cell';

const CSS_VAR_ROW = '--e-grid-empty-cell-row';
const CSS_VAR_COL = '--e-grid-empty-cell-col';
const CSS_VAR_VISIBILITY = '--e-grid-empty-cell-visibility';

export const GridEmptyCellPositioner = ( { element }: ElementOverlayProps ): null => {
	const rect = useElementRect( element );
	const tracks = useGridTracks( element, rect );

	useEffect( () => {
		if ( ! element ) {
			return;
		}

		const firstEmpty = findFirstEmptyCell( element, tracks.columns.length, tracks.rows.length );

		if ( ! firstEmpty ) {
			element.style.setProperty( CSS_VAR_VISIBILITY, 'hidden' );
			return;
		}

		element.style.setProperty( CSS_VAR_ROW, String( firstEmpty.row + 1 ) );
		element.style.setProperty( CSS_VAR_COL, String( firstEmpty.col + 1 ) );
		element.style.setProperty( CSS_VAR_VISIBILITY, 'visible' );
	}, [ element, tracks ] );

	return null;
};
