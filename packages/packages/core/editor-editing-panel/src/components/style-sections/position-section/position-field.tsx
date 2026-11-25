import * as React from 'react';
import { SelectControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const POSITION_LABEL = __( 'Position', 'elementor' );

const positionOptions = [
	{ label: __( 'Static', 'elementor' ), value: 'static' },
	{ label: __( 'Relative', 'elementor' ), value: 'relative' },
	{ label: __( 'Absolute', 'elementor' ), value: 'absolute' },
	{ label: __( 'Fixed', 'elementor' ), value: 'fixed' },
	{ label: __( 'Sticky', 'elementor' ), value: 'sticky' },
];

export const PositionField = ( { label = POSITION_LABEL }: StylesFieldLabelProps ) => {
	return (
		<StylesField bind="position" propDisplayName={ label }>
			<StylesFieldLayout label={ label }>
				<SelectControl options={ positionOptions } />
			</StylesFieldLayout>
		</StylesField>
	);
};
