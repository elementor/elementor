import { createTransformer } from '../create-transformer';

function escapeHtmlAttribute( value: string ): string {
	const specialChars: Record< string, string > = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		"'": '&#39;',
		'"': '&quot;',
	};

	return value.replace( /[&<>'"]/g, ( char ) => specialChars[ char ] || char );
}

export const attributesTransformer = createTransformer( ( values: { key: string; value: string }[] ) => {
	return values
		.map( ( value ) => {
			if ( ! value.key || ! value.value ) {
				return '';
			}
			const escapedValue = escapeHtmlAttribute( value.value );
			return `${ value.key }="${ escapedValue }"`;
		} )
		.join( ' ' );
} );
