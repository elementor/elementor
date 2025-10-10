import * as React from 'react';
import { SelectControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const POSITION_LABEL = __( 'Position', 'elementor' );

const positionOptions = [
	{ label: __( 'Static', 'elementor' ), value: 'static' },
	{ label: __( 'Relative', 'elementor' ), value: 'relative' },
	{ label: __( 'Absolute', 'elementor' ), value: 'absolute' },
	{ label: __( 'Fixed', 'elementor' ), value: 'fixed' },
	{ label: __( 'Sticky', 'elementor' ), value: 'sticky' },
];

type Props = {
	onChange?: ( newValue: string | null, previousValue: string | null | undefined ) => void;
};

export const PositionField = ( { onChange }: Props ) => {
	return (
		<StylesField bind="position" propDisplayName={ POSITION_LABEL }>
			<StylesFieldLayout label={ POSITION_LABEL }>
				<SelectControl options={ positionOptions } onChange={ onChange } />
			</StylesFieldLayout>
		</StylesField>
	);
};
