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

const transformRotateValue = ( value: TransformItemPropValue[ 'value' ] ) =>
	Object.values( value )
		.map( ( axis ) => {
			const size = axis?.value?.size ?? defaultValues.rotate.size;
			const unit = axis?.value?.unit ?? defaultValues.rotate.unit;

			return `${ size }${ unit }`;
		} )
		.join( ', ' );
const transformSkewValue = ( value: TransformItemPropValue[ 'value' ] ) =>
	Object.values( value )
		.map( ( axis ) => {
			const size = axis?.value?.size ?? defaultValues.skew.size;
			const unit = axis?.value?.unit ?? defaultValues.skew.unit;

			return `${ size }${ unit }`;
		} )
		.join( ', ' );

export const TransformLabel = ( props: { value: TransformItemPropValue } ) => {
	const { $$type, value } = props.value;
	switch ( $$type ) {
		case TransformFunctionKeys.move:
			return <Label label={ __( 'Move', 'elementor' ) } value={ transformMoveValue( value ) } />;
		case TransformFunctionKeys.scale:
			return <Label label={ __( 'Scale', 'elementor' ) } value={ transformScaleValue( value ) } />;
		case TransformFunctionKeys.rotate:
			return <Label label={ __( 'Rotate', 'elementor' ) } value={ transformRotateValue( value ) } />;
		case TransformFunctionKeys.skew:
			return <Label label={ __( 'Skew', 'elementor' ) } value={ transformSkewValue( value ) } />;
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
