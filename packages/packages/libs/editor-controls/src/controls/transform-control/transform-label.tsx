import * as React from 'react';
import type { TransformItemPropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { defaultValues, TransformFunctionKeys } from './types';

const transformMoveValue = ( value: TransformItemPropValue[ 'value' ] ) =>
	Object.values( value )
		.map( ( axis ) => {
			const size = axis?.value?.size ?? defaultValues.move.size;
			const unit = axis?.value?.unit ?? defaultValues.move.unit;

			return `${ size }${ unit }`;
		} )
		.join( ', ' );

const transformScaleValue = ( value: TransformItemPropValue[ 'value' ] ) =>
	Object.values( value )
		.map( ( axis ) => axis?.value || defaultValues.scale )
		.join( ', ' );

export const TransformLabel = ( props: { value: TransformItemPropValue } ) => {
	const { $$type, value } = props.value;
	switch ( $$type ) {
		case TransformFunctionKeys.move:
			return <Label label={ __( 'Move', 'elementor' ) } value={ transformMoveValue( value ) } />;
		case TransformFunctionKeys.scale:
			return <Label label={ __( 'Scale', 'elementor' ) } value={ transformScaleValue( value ) } />;
		default:
			return '';
	}
};

const Label = ( { label, value }: { label: string; value: string } ) => {
	return (
		<Box component="span">
			{ label }: { value }
		</Box>
	);
};
