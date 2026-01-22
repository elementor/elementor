import { useMemo } from 'react';
import { getElementorConfig, type SupportedFonts } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { type FontCategory } from '../controls/font-family-control/font-family-control';

const supportedCategories: Record< SupportedFonts, string > = {
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
		const categoriesOrder: SupportedFonts[] = [ 'system', 'custom', 'googlefonts' ];

		return Object.entries( fontFamilies || {} )
			.reduce< FontCategory[] >( ( acc, [ font, category ] ) => {
				if ( ! supportedCategories[ category as SupportedFonts ] ) {
					return acc;
				}

				const categoryIndex = categoriesOrder.indexOf( category );

				if ( ! acc[ categoryIndex ] ) {
					acc[ categoryIndex ] = {
						label: supportedCategories[ category as SupportedFonts ],
						fonts: [],
					};
				}

				acc[ categoryIndex ].fonts.push( font );

				return acc;
			}, [] )
			.filter( Boolean );
	}, [ fontFamilies ] );
};
