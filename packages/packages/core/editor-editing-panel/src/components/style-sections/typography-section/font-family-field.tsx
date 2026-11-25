import * as React from 'react';
import { FontFamilyControl, useFontFamilies } from '@elementor/editor-controls';
import { useSectionWidth } from '@elementor/editor-ui';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const FONT_FAMILY_LABEL = __( 'Font family', 'elementor' );

export const FontFamilyField = ( { label = FONT_FAMILY_LABEL }: StylesFieldLabelProps ) => {
	const fontFamilies = useFontFamilies();
	const sectionWidth = useSectionWidth();

	if ( fontFamilies.length === 0 ) {
		return null;
	}

	return (
		<StylesField bind="font-family" propDisplayName={ label }>
			<StylesFieldLayout label={ label }>
				<FontFamilyControl fontFamilies={ fontFamilies } sectionWidth={ sectionWidth } ariaLabel={ label } />
			</StylesFieldLayout>
		</StylesField>
	);
};
