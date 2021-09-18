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

export const getStyle = ( styles, { theme, props } ) => {
	// Creating an array that holds only the active theme variants values.
	const themeVariants = Object.keys( theme.variants ).filter( ( key ) => theme.variants[ key ] );

	// Adding the 'base' key to be included as the first variant.
	themeVariants.unshift( 'base' );

	let variantStyle = '';

	themeVariants.forEach( ( key ) => {
		const themeVariant = styles[ key ];

		// If key exist in the styles obj (dark, light etc.)
		if ( themeVariant ) {
			variantStyle += themeVariant.shared || '';

			Object.entries( props ).forEach( ( [ propName, propValue ] ) => {
				const styleData = themeVariant[ propName ];

				if ( styleData && propValue ) {
					if ( 'string' === typeof styleData ) {
						variantStyle += styleData;
					} else {
						variantStyle += styleData.shared || '';
						variantStyle += styleData[ propValue ] || '';
					}
				}
			} );
		}
	} );

	console.log( 'variantStyle', variantStyle );

	return variantStyle;
};
