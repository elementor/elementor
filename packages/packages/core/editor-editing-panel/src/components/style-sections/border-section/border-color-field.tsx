import * as React from 'react';
import { ColorControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const BORDER_COLOR_LABEL = __( 'Border color', 'elementor' );

export const BorderColorField = () => (
	<StylesField bind="border-color" propDisplayName={ BORDER_COLOR_LABEL }>
		<StylesFieldLayout label={ BORDER_COLOR_LABEL }>
			<ColorControl />
		</StylesFieldLayout>
	</StylesField>
);
