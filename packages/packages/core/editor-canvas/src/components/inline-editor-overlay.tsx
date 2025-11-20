import * as React from 'react';
import { Box } from '@elementor/ui';
import { InlineEditor } from '@elementor/editor-controls';
import { FloatingPortal } from '@floating-ui/react';

import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import type { ElementOverlayProps } from '../types/element-overlay';
import { CANVAS_WRAPPER_ID } from './outline-overlay';

export function InlineEditorOverlay( { element, isSelected }: ElementOverlayProps ) {
	const { floating, isVisible } = useFloatingOnElement( { element, isSelected } );
	const [ value, setValue ] = React.useState( element.textContent || '' );

	// Update value when element content changes
	React.useEffect( () => {
		setValue( element.textContent || '' );
	}, [ element.textContent ] );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<Box
				ref={ floating.setRef }
				style={ {
					...floating.styles,
					zIndex: 1000,
					pointerEvents: 'auto',
				} }
			>
				<InlineEditor value={ value } setValue={ setValue } />
			</Box>
		</FloatingPortal>
	);
}

