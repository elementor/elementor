import * as React from 'react';
import { useLayoutEffect } from 'react';
import { SelectControl, useBoundProp } from '@elementor/editor-controls';
import { type PropValue } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

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
	onPlaceholderChange: ( placeholder: PropValue ) => void;
};

export const PositionField = ( { onChange, onPlaceholderChange }: Props ) => {
	const { placeholder } = useBoundProp();

	useLayoutEffect( () => {
		onPlaceholderChange( placeholder );
	}, [ onPlaceholderChange, placeholder ] );

	return (
		<StylesFieldLayout label={ POSITION_LABEL }>
			<SelectControl options={ positionOptions } onChange={ onChange } />
		</StylesFieldLayout>
	);
};
