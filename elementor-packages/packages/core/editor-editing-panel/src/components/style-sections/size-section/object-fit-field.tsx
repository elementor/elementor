import * as React from 'react';
import { SelectControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const OBJECT_FIT_LABEL = __( 'Object fit', 'elementor' );

const positionOptions = [
	{ label: __( 'Fill', 'elementor' ), value: 'fill' },
	{ label: __( 'Cover', 'elementor' ), value: 'cover' },
	{ label: __( 'Contain', 'elementor' ), value: 'contain' },
	{ label: __( 'None', 'elementor' ), value: 'none' },
	{ label: __( 'Scale down', 'elementor' ), value: 'scale-down' },
];

export const ObjectFitField = () => {
	return (
		<StylesField bind="object-fit" propDisplayName={ OBJECT_FIT_LABEL }>
			<StylesFieldLayout label={ OBJECT_FIT_LABEL }>
				<SelectControl options={ positionOptions } />
			</StylesFieldLayout>
		</StylesField>
	);
};
