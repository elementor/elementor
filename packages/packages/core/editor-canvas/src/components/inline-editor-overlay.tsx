import * as React from 'react';
import { Box } from '@elementor/ui';
import { InlineEditor } from '@elementor/editor-controls';
import { FloatingPortal } from '@floating-ui/react';
import { getContainer, updateElementSettings, useElementSetting } from '@elementor/editor-elements';
import { htmlPropTypeUtil } from '@elementor/editor-props';

import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import type { ElementOverlayProps } from '../types/element-overlay';
import { CANVAS_WRAPPER_ID } from './outline-overlay';
import { getInlineEditablePropertyName } from '../utils/inline-editing-utils';

export function InlineEditorOverlay( { element, isSelected, id }: ElementOverlayProps ) {
	const { floating, isVisible } = useFloatingOnElement( { element, isSelected } );
	
	const container = getContainer( id );
	const propertyName = getInlineEditablePropertyName( container );
	
	const contentProp = useElementSetting( id, propertyName );
	const contentValue = htmlPropTypeUtil.extract( contentProp );
	const [ value, setValue ] = React.useState( contentValue || '' );

	React.useEffect( () => {
		const extractedValue = htmlPropTypeUtil.extract( contentProp );
		setValue( extractedValue || '' );
	}, [ contentProp ] );

	const handleValueChange = React.useCallback( ( newValue: string ) => {
		setValue( newValue );
		
		updateElementSettings( {
			id,
			props: {
				[ propertyName ]: htmlPropTypeUtil.create( newValue ),
			},
			withHistory: true,
		} );
	}, [ id, propertyName ] );

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

