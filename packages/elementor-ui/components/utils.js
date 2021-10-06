/**
 * @param styles - { base: { shared: '', variant: { shared: '', h1: '', h2: '' } }, dark: { shared: '', variant: { shared: '', h1: '', h2: '' } } }
 * @param config - { variants: { light: true, dark: false } }
 * @param props - { variant: 'h1', size: 'xl' }
 * @returns {object} - { shared: 'background-color: #000;', unique: 'color: #fff;' }
 */
export const getStyle = ( styles, { props, config } ) => {
	const style = {
		shared: '',
		unique: '',
	};

	if ( ! styles ) {
		return style;
	}

	if ( 'string' === typeof styles ) {
		style.unique = styles;

		return style;
	}

	// Creating an array that holds only the active theme variants values.
	const themeVariants = Object.keys( config.variants ).filter( ( key ) => config.variants[ key ] ),
		addStyle = ( data, keys = [] ) => {
			if ( 'string' === typeof data ) {
				style.unique += data;

				return;
			}

			Object.values( keys ).map( ( key ) => {
				const styleObjKey = 'shared' !== key ? 'unique' : 'shared';

				style[ styleObjKey ] += data[ key ] || '';
			} );
		};

	// Adding the 'base' key, to be included as the first variant.
	themeVariants.unshift( 'base' );

	themeVariants.forEach( ( key ) => {
		const themeVariant = styles[ key ];

		// If key exist in the styles obj (dark, light etc.)
		if ( themeVariant ) {
			addStyle( themeVariant, [ 'shared' ] );

			// Getting the styled props css from the styles object.
			Object.entries( props ).forEach( ( [ propName, propValue ] ) => {
				const styleData = themeVariant[ propName ];

				if ( styleData && propValue ) {
					addStyle( styleData, [ 'shared', propValue ] );
				}
			} );
		}
	} );

	return style;
};
