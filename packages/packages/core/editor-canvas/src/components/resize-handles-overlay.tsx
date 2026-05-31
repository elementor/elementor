import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { Box, styled } from '@elementor/ui';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { FloatingPortal } from '@floating-ui/react';
import { __ } from '@wordpress/i18n';

import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import { useHasOverlapping } from '../hooks/use-has-overlapping';
import {
	buildStyleSizeCommitPayload,
	createSizePropFromPixels,
	type SizeAxis,
	useUndoableActiveStyleSizeCommit,
} from '../resize-handles/commit-active-style-size';
import { useActiveStyleTarget } from '../resize-handles/use-active-style-target';
import { useResizeDrag } from '../resize-handles/use-resize-drag';
import type { ElementOverlayProps } from '../types/element-overlay';
import { CANVAS_WRAPPER_ID } from './outline-overlay';

const HANDLE_VISUAL_SIZE_PX = 8;
const HANDLE_HIT_SIZE_PX = 16;
const HANDLE_INSET_PX = 2;

const HandlesContainer = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'isSelected',
} )< { isSelected: boolean } >( ( { isSelected } ) => ( {
	pointerEvents: 'none',
	boxSizing: 'border-box',
	zIndex: isSelected ? 2 : 1,
} ) );

const ResizeHandle = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'handleAxis',
} )< { handleAxis: SizeAxis } >( ( { theme, handleAxis } ) => ( {
	position: 'absolute',
	width: HANDLE_HIT_SIZE_PX,
	height: HANDLE_HIT_SIZE_PX,
	pointerEvents: 'auto',
	cursor: handleAxis === 'width' ? 'ew-resize' : 'ns-resize',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	'&::before': {
		content: '""',
		width: HANDLE_VISUAL_SIZE_PX,
		height: HANDLE_VISUAL_SIZE_PX,
		backgroundColor: theme.palette.primary.main,
		borderRadius: '2px',
	},
} ) );

const WIDTH_LABEL = __( 'Width', 'elementor' );
const HEIGHT_LABEL = __( 'Height', 'elementor' );

export const ResizeHandlesOverlay = ( {
	element,
	isSelected,
	id,
}: ElementOverlayProps ): React.ReactElement | false => {
	const { floating, isVisible } = useFloatingOnElement( { element, isSelected } );
	const hasOverlapping = useHasOverlapping();
	const breakpoint = useActiveBreakpoint();

	const styleMeta = useMemo( () => ( { breakpoint, state: null } ), [ breakpoint ] );
	const activeStyleTarget = useActiveStyleTarget( id );
	const undoableCommit = useUndoableActiveStyleSizeCommit( {
		elementId: id,
		meta: styleMeta,
		target: activeStyleTarget,
	} );

	const commitSize = useCallback(
		( axis: SizeAxis, sizePx: number ) => {
			if ( ! undoableCommit ) {
				return;
			}

			const propDisplayName = axis === 'width' ? WIDTH_LABEL : HEIGHT_LABEL;
			const payload = buildStyleSizeCommitPayload( {
				elementId: id,
				props: {
					[ axis ]: createSizePropFromPixels( sizePx ),
				},
				propDisplayName,
			} );

			if ( ! payload ) {
				return;
			}

			undoableCommit( payload );
		},
		[ id, undoableCommit ]
	);

	const handleCommit = useCallback(
		( sizes: { width: number; height: number }, axis: SizeAxis ) => {
			commitSize( axis, axis === 'width' ? sizes.width : sizes.height );
		},
		[ commitSize ]
	);

	const widthDrag = useResizeDrag( {
		element,
		onPreview: () => {},
		onCommit: ( sizes ) => handleCommit( sizes, 'width' ),
	} );

	const heightDrag = useResizeDrag( {
		element,
		onPreview: () => {},
		onCommit: ( sizes ) => handleCommit( sizes, 'height' ),
	} );

	if ( ! isVisible || hasOverlapping || ! activeStyleTarget ) {
		return false;
	}

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<HandlesContainer
				ref={ floating.setRef }
				isSelected={ isSelected }
				style={ floating.styles }
				data-resize-handles={ id }
				role="presentation"
			>
				<ResizeHandle
					handleAxis="width"
					aria-label={ WIDTH_LABEL }
					style={ {
						right: HANDLE_INSET_PX,
						top: '50%',
						transform: 'translateY(-50%)',
					} }
					onPointerDown={ ( event ) => widthDrag.startDrag( event, 'width' ) }
				/>
				<ResizeHandle
					handleAxis="height"
					aria-label={ HEIGHT_LABEL }
					style={ {
						bottom: HANDLE_INSET_PX,
						left: '50%',
						transform: 'translateX(-50%)',
					} }
					onPointerDown={ ( event ) => heightDrag.startDrag( event, 'height' ) }
				/>
			</HandlesContainer>
		</FloatingPortal>
	);
};
