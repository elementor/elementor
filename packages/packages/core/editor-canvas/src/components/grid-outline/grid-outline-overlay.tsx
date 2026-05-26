import * as React from 'react';
import { booleanPropTypeUtil, type BooleanPropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';
import { FloatingPortal } from '@floating-ui/react';

import { useElementRect } from '../../hooks/use-element-rect';
import { useElementSetting } from '../../hooks/use-element-setting';
import { useFloatingOnElement } from '../../hooks/use-floating-on-element';
import { useGridTracks } from '../../hooks/use-grid-tracks';
import type { ElementOverlayProps } from '../../types/element-overlay';
import { CANVAS_WRAPPER_ID } from '../outline-overlay';
import { GridOutline } from './grid-outline';

export const GridOutlineOverlay = ( { element, id, isSelected }: ElementOverlayProps ): React.ReactElement | null => {
	const setting = useElementSetting< BooleanPropValue >( id, 'grid_outline' );
	const enabled = booleanPropTypeUtil.extract( setting );
	const rect = useElementRect( element );
	const tracks = useGridTracks( element, rect );
	const { isVisible, floating } = useFloatingOnElement( { element, isSelected } );

	if ( ! isSelected || enabled === false || ! isVisible ) {
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
				<GridOutline tracks={ tracks } width={ rect.width } height={ rect.height } />
			</Box>
		</FloatingPortal>
	);
};
