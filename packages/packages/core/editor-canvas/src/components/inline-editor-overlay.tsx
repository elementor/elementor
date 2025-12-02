import * as React from 'react';
import { InlineEditor } from '@elementor/editor-controls';
import { getContainer, updateElementSettings, useElementSetting } from '@elementor/editor-elements';
import { htmlPropTypeUtil } from '@elementor/editor-props';
import { Box } from '@elementor/ui';
import { debounce } from '@elementor/utils';
import { FloatingPortal } from '@floating-ui/react';

import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import type { ElementOverlayProps } from '../types/element-overlay';
import { getInlineEditablePropertyName } from '../utils/inline-editing-utils';
import { CANVAS_WRAPPER_ID } from './outline-overlay';

const OVERLAY_Z_INDEX = 1000;
const DEBOUNCE_DELAY = 100;

export const InlineEditorOverlay = ( { element, isSelected, id }: ElementOverlayProps ): React.ReactElement | null => {
	const { floating, isVisible } = useFloatingOnElement( { element, isSelected } );

	const propertyName = React.useMemo( () => {
		const container = getContainer( id );
		return getInlineEditablePropertyName( container );
	}, [ id ] );

	const contentProp = useElementSetting( id, propertyName );
	const value = React.useMemo( () => htmlPropTypeUtil.extract( contentProp ) || '', [ contentProp ] );

	const debouncedUpdateRef = React.useRef< ReturnType< typeof debounce > | null >( null );
	const lastValueRef = React.useRef< string >( '' );

	React.useEffect( () => {
		debouncedUpdateRef.current = debounce( ( newValue: string ) => {
			const textContent = newValue.replace( /<[^>]*>/g, '' ).trim();
			const valueToSave = textContent === '' ? '&nbsp;' : newValue;

			updateElementSettings( {
				id,
				props: {
					[ propertyName ]: htmlPropTypeUtil.create( valueToSave ),
				},
				withHistory: true,
			} );
		}, DEBOUNCE_DELAY );

		return () => {
			debouncedUpdateRef.current?.cancel?.();
		};
	}, [ id, propertyName ] );

	const handleValueChange = React.useCallback( ( newValue: string ) => {
		lastValueRef.current = newValue;
		debouncedUpdateRef.current?.( newValue );
	}, [] );

	React.useEffect( () => {
		if ( ! isVisible && debouncedUpdateRef.current?.pending?.() ) {
			debouncedUpdateRef.current.flush( lastValueRef.current );
		}
	}, [ isVisible ] );

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
				<InlineEditor value={ value } setValue={ handleValueChange } showToolbar={ isSelected } />
			</Box>
		</FloatingPortal>
	);
};
