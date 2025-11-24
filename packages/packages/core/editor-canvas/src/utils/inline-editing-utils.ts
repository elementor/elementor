import { getElementType, type V1Element } from '@elementor/editor-elements';

function getHtmlPropertyName( container: V1Element | null ): string {
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
}

export function hasInlineEditableProperty( container: V1Element | null ): boolean {
	return !! getHtmlPropertyName( container );
}

export function getInlineEditablePropertyName( container: V1Element | null ): string {
	return getHtmlPropertyName( container );
}
