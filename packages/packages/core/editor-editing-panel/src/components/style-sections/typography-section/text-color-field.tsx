import * as React from 'react';
import { ColorControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const TEXT_COLOR_LABEL = __( 'Text color', 'elementor' );

export const TextColorField = ( { label = TEXT_COLOR_LABEL }: StylesFieldLabelProps ) => {
	return (
		<StylesField bind="color" propDisplayName={ label }>
			<StylesFieldLayout label={ label }>
				<ColorControl id="text-color-control" />
			</StylesFieldLayout>
		</StylesField>
	);
};
