import * as React from 'react';
import { useElementEditorSettings } from '@elementor/editor-elements';
import { Box } from '@elementor/ui';
import { FloatingPortal } from '@floating-ui/react';

import { useElementRect } from '../../hooks/use-element-rect';
import { useFloatingOnElement } from '../../hooks/use-floating-on-element';
import { useGridTracks } from '../../hooks/use-grid-tracks';
import type { ElementOverlayProps } from '../../types/element-overlay';
import { CANVAS_WRAPPER_ID } from '../outline-overlay';
import { GridOutline } from './grid-outline';

export const GridOutlineOverlay = ( { element, id, isSelected }: ElementOverlayProps ): React.ReactElement | null => {	
	const settings = useElementEditorSettings( id );
	const enabled = settings?.grid_outline;
	const rect = useElementRect( element );
	const tracks = useGridTracks( element, rect );
	const { floating } = useFloatingOnElement( { element, isSelected } );

	if ( enabled === false ) {
		return null;
	}

	if ( tracks.columns.length === 0 && tracks.rows.length === 0 ) {
		return null;
	}

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<Box
				ref={ floating.setRef }
				style={ { ...floating.styles, pointerEvents: 'none' } }
				data-grid-outline={ id }
				role="presentation"
			>
				<GridOutline element={ element } tracks={ tracks } width={ rect.width } height={ rect.height } />
			</Box>
		</FloatingPortal>
	);
};
