import * as React from 'react';

import { useCallback, useEffect, useMemo } from 'react';
import { getContainer, getElementType } from '@elementor/editor-elements';
import { useElementSetting, updateElementSettings } from '@elementor/editor-elements';
import { htmlPropTypeUtil, type TransformablePropValue } from '@elementor/editor-props';
import { ThemeProvider } from '@elementor/editor-ui';

import { InlineEditor } from './inline-editor';

type InlineEditingReplacementProps = {
	elementId: string;
	classes?: string;
	expectedTag?: string | null;
	toolbarOffset?: { left: number; top: number };
	onComplete?: () => void;
};

const getWidgetType = ( container: ReturnType<typeof getContainer> ) => {
	return container?.model?.get( 'widgetType' ) ?? container?.model?.get( 'elType' ) ?? null;
};

const getInlineEditablePropertyName = ( container: ReturnType<typeof getContainer> ): string => {
	const WIDGET_PROPERTY_MAP: Record< string, string > = {
		'e-heading': 'title',
		'e-paragraph': 'paragraph',
	};

	const widgetType = getWidgetType( container );

	if ( ! widgetType ) {
		return '';
	}

	if ( WIDGET_PROPERTY_MAP[ widgetType ] ) {
		return WIDGET_PROPERTY_MAP[ widgetType ];
	}

	const propsSchema = getElementType( widgetType )?.propsSchema;

	if ( ! propsSchema ) {
		return '';
	}

	const entry = Object.entries( propsSchema ).find( ( [ , propType ] ) => {
		switch ( propType.kind ) {
			case 'union':
				return propType.prop_types.html;
			case 'object':
				return propType.shape.html;
			case 'array':
				return 'key' in propType.item_prop_type && propType.item_prop_type.key === 'html';
		}

		return propType.key === 'html';
	} );

	return entry?.[ 0 ] ?? '';
};


const wrapValueWithTag = ( value: string | null, tag: string | null ): string => {
	if ( ! value ) {
		return '';
	}

	if ( ! tag ) {
		return value;
	}

	const compareTag = ( el: Element, expectedTag: string ) => {
		return el.tagName.toUpperCase() === expectedTag.toUpperCase();
	};

	const pseudoElement = document.createElement( 'div' );
	pseudoElement.innerHTML = value;

	if ( ! pseudoElement?.children.length ) {
		return `<${ tag }>${ value }</${ tag }>`;
	}

	const firstChild = pseudoElement.children[ 0 ];
	const lastChild = Array.from( pseudoElement.children ).slice( -1 )[ 0 ];

	if ( firstChild === lastChild && pseudoElement.textContent === firstChild.textContent ) {
		return compareTag( firstChild, tag ) ? value : `<${ tag }>${ firstChild.innerHTML }</${ tag }>`;
	}

	if ( ! value.startsWith( `<${ tag }` ) || ! value.endsWith( `</${ tag }>` ) ) {
		return `<${ tag }>${ value }</${ tag }>`;
	}

	if ( firstChild !== lastChild || ! compareTag( firstChild, tag ) ) {
		return `<${ tag }>${ value }</${ tag }>`;
	}

	return value;
};


export const InlineEditingReplacement = ( {
	elementId,
	classes = '',
	expectedTag = null,
	toolbarOffset = { left: 0, top: 0 },
	onComplete,
}: InlineEditingReplacementProps ) => {
	const container = useMemo( () => getContainer( elementId ), [ elementId ] );
	const propName = useMemo( () => getInlineEditablePropertyName( container ), [ container ] );
	const initialValue = useMemo( () => {
		const value = container?.settings?.get?.( propName );
		return htmlPropTypeUtil.extract( value ) ?? '';
	}, [ container, propName ] );
	const extractedValue = initialValue;

	const ensureProperValue = useCallback( () => {
		const wrappedValue = wrapValueWithTag( extractedValue, expectedTag );

		if ( extractedValue !== wrappedValue ) {
			updateElementSettings( {
				id: elementId,
				props: { [ propName ]: htmlPropTypeUtil.create( wrappedValue ) },
			} );
		}
	}, [ elementId, propName, extractedValue, expectedTag ] );

	useEffect( () => {
		ensureProperValue();
	}, [ ensureProperValue ] );

	const handleChange = useCallback(
		( newValue: string | null ) => {
			const wrappedValue = wrapValueWithTag( newValue, expectedTag );
			const valueToSave = wrappedValue ? htmlPropTypeUtil.create( wrappedValue ) : null;

			updateElementSettings( {
				id: elementId,
				props: { [ propName ]: valueToSave },
			} );
		},
		[ elementId, propName, expectedTag ]
	);

	return (
		<ThemeProvider>
			<InlineEditor
				attributes={ { class: classes } }
				value={ extractedValue }
				setValue={ handleChange }
				expectedTag={ expectedTag }
				getInitialPopoverPosition={ () => toolbarOffset }
				onBlur={ onComplete }
				showToolbar
				autofocus
			/>
		</ThemeProvider>
	);
};

