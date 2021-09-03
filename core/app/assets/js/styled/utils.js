import { css } from 'styled-components';

const bindProp = ( obj ) => {
	const [ key, value ] = Object.entries( obj )[ 0 ];

	return value && css`
			${ key }: ${ value };
		`;
};

export const bindProps = ( data ) => {
	if ( ! Array.isArray( data ) ) {
		data = [ data ];
	}

	return data.map( ( obj ) => bindProp( obj ) );
};

export const getVariant = ( props, style, variant ) => {
	let variantStyle = style.root?.shared || '',
		themeVariants = props.theme.variants;

	variantStyle += style.root?.variants?.[ variant ] || '';

	for ( const key in themeVariants ) {
		// e.g: if dark = true.
		if ( themeVariants[ key ] ) {
			const themeVariant = style[ key ];

			// If key exist in the style obj.
			if ( themeVariant ) {
				variantStyle += themeVariant.shared || '';
				variantStyle += themeVariant.variants?.[ variant ] || '';
			}
		}
	}

	return variantStyle;
};
