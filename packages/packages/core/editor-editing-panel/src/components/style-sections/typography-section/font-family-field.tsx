import * as React from 'react';
import { FontFamilyControl, useFontFamilies } from '@elementor/editor-controls';
import { useSectionWidth } from '@elementor/editor-ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const FONT_FAMILY_LABEL = __( 'Font family', 'elementor' );

export const FontFamilyField = () => {
	const fontFamilies = useFontFamilies();
	const sectionWidth = useSectionWidth();

	if ( fontFamilies.length === 0 ) {
		return null;
	}

	return (
		<StylesField bind="font-family" propDisplayName={ FONT_FAMILY_LABEL }>
			<StylesFieldLayout label={ FONT_FAMILY_LABEL }>
				<FontFamilyControl
					fontFamilies={ fontFamilies }
					sectionWidth={ sectionWidth }
					ariaLabel={ FONT_FAMILY_LABEL }
				/>
			</StylesFieldLayout>
		</StylesField>
	);
};
