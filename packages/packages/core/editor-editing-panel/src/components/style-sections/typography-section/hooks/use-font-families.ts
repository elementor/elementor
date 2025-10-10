import { useMemo } from 'react';
import { type FontCategory } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { getElementorConfig } from '../../../../sync/get-elementor-globals';

const supportedCategories: Record< string, string > = {
	system: __( 'System', 'elementor' ),
	custom: __( 'Custom Fonts', 'elementor' ),
	googlefonts: __( 'Google Fonts', 'elementor' ),
};

const getFontFamilies = () => {
	const { controls } = getElementorConfig();

	const options = controls?.font?.options;

	if ( ! options ) {
		return null;
	}

	return options;
};

export const useFontFamilies = () => {
	const fontFamilies = getFontFamilies();

	return useMemo( () => {
		const categoriesOrder = [ 'system', 'custom', 'googlefonts' ];

		return Object.entries( fontFamilies || {} )
			.reduce< FontCategory[] >( ( acc, [ font, category ] ) => {
				if ( ! supportedCategories[ category ] ) {
					return acc;
				}

				const categoryIndex = categoriesOrder.indexOf( category );

				if ( ! acc[ categoryIndex ] ) {
					acc[ categoryIndex ] = {
						label: supportedCategories[ category ],
						fonts: [],
					};
				}

				acc[ categoryIndex ].fonts.push( font );

				return acc;
			}, [] )
			.filter( Boolean );
	}, [ fontFamilies ] );
};
