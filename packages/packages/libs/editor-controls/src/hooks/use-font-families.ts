import { useMemo } from 'react';
import { getElementorConfig, type SupportedFonts } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { type FontCategory } from '../controls/font-family-control/font-family-control';

const SYSTEM_GROUP = 0;
const CUSTOM_GROUP = 1;
const GOOGLE_GROUP = 2;

const categoryGroupIndex: Record< SupportedFonts, number > = {
	system: SYSTEM_GROUP,
	custom: CUSTOM_GROUP,
	local: CUSTOM_GROUP,
	googlefonts: GOOGLE_GROUP,
	earlyaccess: GOOGLE_GROUP,
};

const groupLabels: Record< number, string > = {
	[ SYSTEM_GROUP ]: __( 'System', 'elementor' ),
	[ CUSTOM_GROUP ]: __( 'Custom Fonts', 'elementor' ),
	[ GOOGLE_GROUP ]: __( 'Google Fonts', 'elementor' ),
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
		return Object.entries( fontFamilies || {} )
			.reduce< FontCategory[] >( ( acc, [ font, category ] ) => {
				const groupIndex = categoryGroupIndex[ category as SupportedFonts ];

				if ( groupIndex === undefined ) {
					return acc;
				}

				if ( ! acc[ groupIndex ] ) {
					acc[ groupIndex ] = {
						label: groupLabels[ groupIndex ],
						fonts: [],
					};
				}

				acc[ groupIndex ].fonts.push( font );

				return acc;
			}, [] )
			.filter( Boolean );
	}, [ fontFamilies ] );
};
