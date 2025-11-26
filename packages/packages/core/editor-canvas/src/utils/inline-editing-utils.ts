import { getContainer, getElementType, type V1Element } from '@elementor/editor-elements';

const getHtmlPropertyName = ( container: V1Element | null ): string => {
	const widgetType = container?.model?.get( 'widgetType' ) ?? container?.model?.get( 'elType' );

	if ( ! widgetType ) {
		return '';
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
	return !! getHtmlPropertyName( container );
};

export const getInlineEditablePropertyName = ( container: V1Element | null ): string => {
	return getHtmlPropertyName( container );
};
