import { getContainer, getElementType, type V1Element } from '@elementor/editor-elements';

const WIDGET_PROPERTY_MAP: Record< string, string > = {
	'e-heading': 'title',
	'e-paragraph': 'paragraph',
};

const getHtmlPropertyName = ( container: V1Element | null ): string => {
	const widgetType = container?.model?.get( 'widgetType' ) ?? container?.model?.get( 'elType' );

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

	const entry = Object.entries( propsSchema ).find( ( [ , propType ] ) => propType.key === 'html' );

	return entry?.[ 0 ] ?? '';
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
	return getHtmlPropertyName( container );
};
