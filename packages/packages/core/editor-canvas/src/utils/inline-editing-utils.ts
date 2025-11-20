import { type V1Element } from '@elementor/editor-elements';
import { htmlPropTypeUtil } from '@elementor/editor-props';

function getSettings( container: V1Element | null ) {
	return container?.settings?.toJSON() ?? {};
}

export function hasInlineEditableProperty( container: V1Element | null ): boolean {
	return Object.values( getSettings( container ) ).some( ( value ) => htmlPropTypeUtil.isValid( value ) );
}

export function getInlineEditablePropertyName( container: V1Element | null ): string {
	const entry = Object.entries( getSettings( container ) ).find( ( [ , value ] ) => htmlPropTypeUtil.isValid( value ) );
	return entry?.[ 0 ] ?? '';
}

