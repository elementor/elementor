const CUSTOM_CSS_SEPARATOR = '\n';

export const mergeCustomCssText = ( ...cssParts: Array< string | undefined > ): string =>
	cssParts
		.map( ( cssPart ) => cssPart?.trim() )
		.filter( ( cssPart ): cssPart is string => !! cssPart )
		.join( CUSTOM_CSS_SEPARATOR );

export const readStoredCustomCssText = ( raw: string | undefined ): string => {
	if ( ! raw ) {
		return '';
	}

	try {
		return atob( raw );
	} catch {
		return '';
	}
};
