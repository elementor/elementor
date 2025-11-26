import * as React from 'react';
import { createPortal } from 'react-dom';
import { InlineEditor } from '@elementor/editor-controls';
import { getContainer, updateElementSettings, useElementSetting } from '@elementor/editor-elements';
import { htmlPropTypeUtil } from '@elementor/editor-props';
import { Box } from '@elementor/ui';
import { FloatingPortal } from '@floating-ui/react';

import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import type { ElementOverlayProps } from '../types/element-overlay';
import { getInlineEditablePropertyName } from '../utils/inline-editing-utils';
import { CANVAS_WRAPPER_ID } from './outline-overlay';

export function InlineEditorOverlay( { element, isSelected, id }: ElementOverlayProps ) {
	// const { floating, isVisible } = useFloatingOnElement( { element, isSelected } );

	const propertyName = React.useMemo( () => getInlineEditablePropertyName( id ), [ id ] );

	const contentProp = useElementSetting( id, propertyName );
	const value = React.useMemo( () => htmlPropTypeUtil.extract( contentProp ) || '', [ contentProp ] );

	const handleValueChange = React.useCallback(
		( newValue: string ) => {
			updateElementSettings( {
				id,
				props: {
					[ propertyName ]: htmlPropTypeUtil.create( newValue ),
				},
				withHistory: true,
			} );
		},
		[ id, propertyName ]
	);

	const container = getContainer( id );

	console.log( container );

	// if ( ! isVisible ) {
	// 	return null;
	// }
	const elementView = container?.view?.el;

	if ( ! elementView ) {
		return null;
	}

	// elementView.innerHTML = '';

	// return createPortal( <InlineEditor value={ value } setValue={ handleValueChange } />, element );
}
