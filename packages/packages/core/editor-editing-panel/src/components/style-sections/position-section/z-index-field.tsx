import * as React from 'react';
import { NumberControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const Z_INDEX_LABEL = __( 'Z-index', 'elementor' );

export const ZIndexField = () => {
	return (
		<StylesField bind="z-index" propDisplayName={ Z_INDEX_LABEL }>
			<StylesFieldLayout label={ Z_INDEX_LABEL }>
				<NumberControl />
			</StylesFieldLayout>
		</StylesField>
	);
};
