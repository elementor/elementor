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
 * @param theme - { variants: { light: true, dark: false } }
 * @param props - { variant: 'h1' }
 * @returns {string}
 */
export const getStyle = ( styles, { theme, props } ) => {
	if ( 'string' === typeof styles ) {
		styles = { base: styles };
	}

	// Creating an array that holds only the active theme variants values.
	const themeVariants = Object.keys( theme.variants ).filter( ( key ) => theme.variants[ key ] );

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

export const mergeStyles = ( ...styles ) => {
	// Making sure that each value of styles is an object with the specific styles structure.
	styles = styles.map( ( style ) => 'string' === typeof style ? { base: { shared: style } } : style );

	const mergedObj = {};

	// Merging the styles objects.

	return '';
};
