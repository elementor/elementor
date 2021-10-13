/**
 * @param styles {object} - { base: { shared: '', variant: { shared: '', h1: '', h2: '' } }, dark: { shared: '', variant: { shared: '', h1: '', h2: '' } } }
 * @param config {object} - { variants: { light: true, dark: false } }
 * @param props {object} - { variant: 'h1', size: 'xl' }
 * @param type {string} - shared/unique (in case that only the shared/unique styles are needed)
 * @returns {string} - 'background-color: #000; color: #fff;'
 */
export const getStyle = ( styles, props, type ) => {
	if ( ! styles ) {
		return '';
	}

	if ( 'string' === typeof styles ) {
		return styles;
	}

	const config = props?.theme?.config || { variants: {} },
		style = {
			shared: '',
			unique: '',
		};

	// Creating an array that holds only the active theme variants values.
	const themeVariants = Object.keys( config.variants ).filter( ( key ) => config.variants[ key ] ),
		addStyle = ( data, keys = [] ) => {
			if ( 'string' === typeof data && 'unique' !== type ) {
				style.shared += data;

				return;
			}

			Object.values( keys ).map( ( key ) => {
				const styleObjKey = 'shared' !== key ? 'unique' : 'shared';

				if ( ! type || styleObjKey === type ) {
					style[ styleObjKey ] += data[ key ] || '';
				}
			} );
		};

	// Adding the 'base' key, to be included as the first variant.
	themeVariants.unshift( 'base' );

	themeVariants.forEach( ( key ) => {
		const themeVariant = styles[ key ];

		// If key exist in the styles obj (dark, light etc.)
		if ( themeVariant ) {
			addStyle( themeVariant, [ 'shared' ] );

			const styledProps = getStyledProps( props );

			// Getting the styled props css from the styles object.
			Object.entries( styledProps ).forEach( ( [ propName, propValue ] ) => {
				const styleData = themeVariant[ propName ];

				if ( styleData && propValue ) {
					addStyle( styleData, [ 'shared', propValue ] );
				}
			} );
		}
	} );

	// Both properties are returned but their values are depended on the third argument of this function, if empty: both will be calculated.
	return style.shared + style.unique;
};

const getStyledProps = ( props ) => {
	const styledProps = { ...props };

	// Removing props names that are not related to the styles objects.
	[ 'className', 'children', 'tag', 'as', 'theme' ].forEach( ( prop ) => delete styledProps[ prop ] );

	return styledProps;
};
