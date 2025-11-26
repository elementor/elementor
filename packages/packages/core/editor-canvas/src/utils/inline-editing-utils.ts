import { getContainer, getElementType, type V1Element } from '@elementor/editor-elements';

const INLINE_EDITABLE_WIDGET_TYPES = new Set( [ 'e-heading', 'e-paragraph' ] );

const getHtmlPropertyName = ( container: V1Element | null ): string => {
	const widgetType = container?.model?.get( 'widgetType' ) ?? container?.model?.get( 'elType' );

	const propsSchema = widgetType ? getElementType( widgetType )?.propsSchema : null;

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

	return INLINE_EDITABLE_WIDGET_TYPES.has( widgetType );
};

export const getInlineEditablePropertyName = ( container: V1Element | null ): string => {
	return getHtmlPropertyName( container );
};
