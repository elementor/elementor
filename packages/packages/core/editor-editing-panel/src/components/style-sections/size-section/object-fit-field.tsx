import * as React from 'react';
import { SelectControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const OBJECT_FIT_LABEL = __( 'Object fit', 'elementor' );

const positionOptions = [
	{ label: __( 'Fill', 'elementor' ), value: 'fill' },
	{ label: __( 'Cover', 'elementor' ), value: 'cover' },
	{ label: __( 'Contain', 'elementor' ), value: 'contain' },
	{ label: __( 'None', 'elementor' ), value: 'none' },
	{ label: __( 'Scale down', 'elementor' ), value: 'scale-down' },
];

export const ObjectFitField = ( { label = OBJECT_FIT_LABEL }: StylesFieldLabelProps ) => {
	return (
		<StylesField bind="object-fit" propDisplayName={ label }>
			<StylesFieldLayout label={ label }>
				<SelectControl options={ positionOptions } />
			</StylesFieldLayout>
		</StylesField>
	);
};
