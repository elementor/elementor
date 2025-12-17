import { getContainer, getElementType, type V1Element } from '@elementor/editor-elements';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { type LegacyWindow } from '../legacy/types';

const WIDGET_PROPERTY_MAP: Record< string, string > = {
	'e-heading': 'title',
	'e-paragraph': 'paragraph',
};

const EXPERIMENT_KEY = 'v4-inline-text-editing';

export const legacyWindow = window as unknown as LegacyWindow;

export const shouldRenderInlineEditingView = ( elementType: string ): boolean => {
	return elementType in WIDGET_PROPERTY_MAP && isExperimentActive( EXPERIMENT_KEY );
};

export const getWidgetType = ( container: V1Element | null ) => {
	return container?.model?.get( 'widgetType' ) ?? container?.model?.get( 'elType' ) ?? null;
};

export const getHtmlPropertyName = ( container: V1Element | null ) => {
	const widgetType = getWidgetType( container );

	if ( ! widgetType ) {
		return '';
	}

	const propsSchema = getElementType( widgetType )?.propsSchema;

	if ( WIDGET_PROPERTY_MAP[ widgetType ] ) {
		return WIDGET_PROPERTY_MAP[ widgetType ];
	}

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

export const getHtmlPropType = ( container: V1Element | null ) => {
	const widgetType = getWidgetType( container );

	if ( ! widgetType ) {
		return null;
	}

	const propsSchema = getElementType( widgetType )?.propsSchema;
	const propertyName = getHtmlPropertyName( container ) ?? null;

	return propsSchema?.[ propertyName ] ?? null;
};

export const hasInlineEditableProperty = ( containerId: string ): boolean => {
	const container = getContainer( containerId );
	const widgetType = container?.model?.get( 'widgetType' ) ?? container?.model?.get( 'elType' );

	if ( ! widgetType ) {
		return false;
	}

	return widgetType in WIDGET_PROPERTY_MAP;
};

export const getInlineEditablePropertyName = ( container: V1Element | null ): string => {
	return getHtmlPropertyName( container ) ?? '';
};

export const getBlockedValue = ( value: string | null, tag: string | null ) => {
	if ( ! value ) {
		return '';
	}

	if ( ! tag ) {
		return value;
	}

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

export const compareTag = ( el: Element, tag: string ) => {
	return el.tagName.toUpperCase() === tag.toUpperCase();
};

export const getInitialPopoverPosition = () => {
	const positionFallback = { left: 0, top: 0 };

	const iFrameElement = legacyWindow?.elementor?.$preview?.get( 0 );
	const iFramePosition = iFrameElement?.getBoundingClientRect() ?? positionFallback;

	const previewElement = legacyWindow?.elementor?.$previewWrapper?.get( 0 );
	const previewPosition = previewElement
		? { left: previewElement.scrollLeft, top: previewElement.scrollTop }
		: positionFallback;

	return {
		left: iFramePosition.left + previewPosition.left,
		top: iFramePosition.top + previewPosition.top,
	};
};
