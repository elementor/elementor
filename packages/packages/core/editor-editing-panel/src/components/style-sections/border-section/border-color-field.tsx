import * as React from 'react';
import { ColorControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const BORDER_COLOR_LABEL = __( 'Border color', 'elementor' );

export const BorderColorField = ( { label = BORDER_COLOR_LABEL }: StylesFieldLabelProps ) => (
	<StylesField bind="border-color" propDisplayName={ label }>
		<StylesFieldLayout label={ label }>
			<ColorControl />
		</StylesFieldLayout>
	</StylesField>
);
