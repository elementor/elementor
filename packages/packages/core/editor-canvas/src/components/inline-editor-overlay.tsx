import * as React from 'react';
import { InlineEditor } from '@elementor/editor-controls';
import { getContainer, updateElementSettings, useElementSetting } from '@elementor/editor-elements';
import { htmlPropTypeUtil } from '@elementor/editor-props';
import { Box } from '@elementor/ui';
import { FloatingPortal } from '@floating-ui/react';

import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import type { ElementOverlayProps } from '../types/element-overlay';
import { getInlineEditablePropertyName } from '../utils/inline-editing-utils';
import { CANVAS_WRAPPER_ID } from './outline-overlay';

const OVERLAY_Z_INDEX = 1000;

export const InlineEditorOverlay = ( { element, isSelected, id }: ElementOverlayProps ): React.ReactElement | null => {
	const { floating, isVisible } = useFloatingOnElement( { element, isSelected } );

	const propertyName = React.useMemo( () => {
		const container = getContainer( id );
		return getInlineEditablePropertyName( container );
	}, [ id ] );

	const contentProp = useElementSetting( id, propertyName );
	const value = React.useMemo( () => htmlPropTypeUtil.extract( contentProp ) || '', [ contentProp ] );

	const handleValueChange = React.useCallback(
		( newValue: string ) => {
			const textContent = newValue.replace( /<[^>]*>/g, '' ).trim();
			const valueToSave = textContent === '' ? '&nbsp;' : newValue;

			updateElementSettings( {
				id,
				props: {
					[ propertyName ]: htmlPropTypeUtil.create( valueToSave ),
				},
				withHistory: true,
			} );
		},
		[ id, propertyName ]
	);

	if ( ! isVisible ) {
		return null;
	}

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<Box
				ref={ floating.setRef }
				style={ {
					...floating.styles,
					zIndex: OVERLAY_Z_INDEX,
					pointerEvents: 'auto',
				} }
			>
				<InlineEditor value={ value } setValue={ handleValueChange } />
			</Box>
		</FloatingPortal>
	);
}
