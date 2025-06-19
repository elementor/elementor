import * as React from 'react';
import { FontFamilyControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { useSectionRef } from '../../../components/section';
import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';
import { useFontFamilies } from './hooks/use-font-families';

const FONT_FAMILY_LABEL = __( 'Font family', 'elementor' );

export const FontFamilyField = () => {
	const fontFamilies = useFontFamilies();
	const sectionRef = useSectionRef();

	if ( fontFamilies.length === 0 ) {
		return null;
	}

	const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;

	return (
		<StylesField bind="font-family" propDisplayName={ FONT_FAMILY_LABEL }>
			<StylesFieldLayout label={ FONT_FAMILY_LABEL }>
				<FontFamilyControl fontFamilies={ fontFamilies } sectionWidth={ sectionWidth } />
			</StylesFieldLayout>
		</StylesField>
	);
};
