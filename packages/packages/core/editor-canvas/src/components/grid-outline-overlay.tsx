import * as React from 'react';
import { FloatingPortal } from '@floating-ui/react';

import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import { useGridTracks } from '../hooks/use-grid-tracks';
import type { ElementOverlayProps } from '../types/element-overlay';
import { buildAxisDashMask, buildAxisLineGradient } from '../utils/grid-gradient';
import { CANVAS_WRAPPER_ID } from './outline-overlay';

const OUTLINE_COLOR = '#9da5ae';

export const GridOutlineOverlay = ( { element, isSelected }: ElementOverlayProps ): React.ReactElement | false => {
	const { floating } = useFloatingOnElement( { element, isSelected } );
	const tracks = useGridTracks( element );

	const hasGrid = tracks.columns.length > 0 && tracks.rows.length > 0;

	if ( ! hasGrid ) {
		return false;
	}

	const columnsLines = buildAxisLineGradient( 'columns', tracks, OUTLINE_COLOR );
	const rowsLines = buildAxisLineGradient( 'rows', tracks, OUTLINE_COLOR );
	const columnsMask = buildAxisDashMask( 'columns' );
	const rowsMask = buildAxisDashMask( 'rows' );

	const layerStyle: React.CSSProperties = {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		pointerEvents: 'none',
	};

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<div
				ref={ floating.setRef }
				style={ { ...floating.styles, pointerEvents: 'none' } }
				data-grid-outline-overlay=""
				role="presentation"
			>
				<div
					style={ {
						...layerStyle,
						backgroundImage: columnsLines,
						WebkitMaskImage: columnsMask,
						maskImage: columnsMask,
					} }
				/>
				<div
					style={ {
						...layerStyle,
						backgroundImage: rowsLines,
						WebkitMaskImage: rowsMask,
						maskImage: rowsMask,
					} }
				/>
			</div>
		</FloatingPortal>
	);
};
