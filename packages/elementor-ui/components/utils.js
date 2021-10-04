/**
 * @param styles - { base: { shared: '', variant: { shared: '', h1: '', h2: '' } }, dark: { shared: '', variant: { shared: '', h1: '', h2: '' } } }
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
	const themeVariants = Object.keys( config.variants ).filter( ( key ) => config.variants[ key ] ),
		getStyleValue = ( data, keys = [] ) => {
			if ( 'string' === typeof data ) {
				return data;
			}

			return Object.values( keys ).map( ( key ) => data[ key ] || '' ).join( '' );
		};

	// Adding the 'base' key, to be included as the first variant.
	themeVariants.unshift( 'base' );

	let variantStyle = '';

	themeVariants.forEach( ( key ) => {
		const themeVariant = styles[ key ];

		// If key exist in the styles obj (dark, light etc.)
		if ( themeVariant ) {
			variantStyle += getStyleValue( themeVariant, [ 'shared' ] );

			// Getting the styled props css from the styles object.
			Object.entries( props ).forEach( ( [ propName, propValue ] ) => {
				const styleData = themeVariant[ propName ];

				if ( styleData && propValue ) {
					variantStyle += getStyleValue( styleData, [ 'shared', propValue ] );
				}
			} );
		}
	} );

	return variantStyle;
};
