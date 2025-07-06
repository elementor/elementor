import * as React from 'react';
import { ColorControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const TEXT_COLOR_LABEL = __( 'Text color', 'elementor' );

export const TextColorField = () => {
	return (
		<StylesField bind="color" propDisplayName={ TEXT_COLOR_LABEL }>
			<StylesFieldLayout label={ TEXT_COLOR_LABEL }>
				<ColorControl />
			</StylesFieldLayout>
		</StylesField>
	);
};
