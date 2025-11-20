import * as React from 'react';
import { Box } from '@elementor/ui';
import { InlineEditor } from '@elementor/editor-controls';
import { FloatingPortal } from '@floating-ui/react';
import { updateElementSettings, useElementSetting } from '@elementor/editor-elements';
import { htmlPropTypeUtil } from '@elementor/editor-props';

import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import type { ElementOverlayProps } from '../types/element-overlay';
import { CANVAS_WRAPPER_ID } from './outline-overlay';

export function InlineEditorOverlay( { element, isSelected, id }: ElementOverlayProps ) {
	const { floating, isVisible } = useFloatingOnElement( { element, isSelected } );
	
	const titleProp = useElementSetting( id, 'title' );
	const titleValue = htmlPropTypeUtil.extract( titleProp );
	const [ value, setValue ] = React.useState( titleValue || '' );

	React.useEffect( () => {
		const extractedValue = htmlPropTypeUtil.extract( titleProp );
		setValue( extractedValue || '' );
	}, [ titleProp ] );

	const handleValueChange = React.useCallback( ( newValue: string ) => {
		setValue( newValue );
		
		updateElementSettings( {
			id,
			props: {
				title: htmlPropTypeUtil.create( newValue ),
			},
			withHistory: true,
		} );
	}, [ id ] );

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
				<InlineEditor value={ value } setValue={ handleValueChange } />
			</Box>
		</FloatingPortal>
	);
}

