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

/**
 * @param styles - { base: { shared: '', variant: { h1: '', h2: '' } }, dark: { shared: '', variant: { h1: '', h2: '' } } }
 * @param config - { variants: { light: true, dark: false } }
 * @param props - { variant: 'h1', size: 'xl' }
 * @returns {string}
 */
export const getStyle = ( styles, { props, config } ) => {
	if ( ! styles ) {
		return '';
	}

	if ( 'string' === typeof styles ) {
		return styles;
	}

	// Creating an array that holds only the active theme variants values.
	const themeVariants = Object.keys( config.variants ).filter( ( key ) => config.variants[ key ] );

	// Adding the 'base' key to be included as the first variant.
	themeVariants.unshift( 'base' );

	let variantStyle = '';

	themeVariants.forEach( ( key ) => {
		const themeVariant = styles[ key ];

		// If key exist in the styles obj (dark, light etc.)
		if ( themeVariant ) {
			if ( 'string' === typeof themeVariant ) {
				variantStyle += themeVariant;
			} else {
				variantStyle += themeVariant.shared || '';
			}

			// Getting the styled props css from the styles object.
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

	return variantStyle;
};
