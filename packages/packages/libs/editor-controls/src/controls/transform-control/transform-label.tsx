import * as React from 'react';
import type { TransformItemPropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { TransformFunctionKeys } from './types';

const transformMoveValue = ( value: TransformItemPropValue[ 'value' ] ) =>
	Object.values( value )
		.map( ( axis ) => `${ axis?.value.size }${ axis?.value.unit }` )
		.join( ', ' );

const transformScaleValue = ( value: TransformItemPropValue[ 'value' ] ) =>
	Object.values( value )
		.map( ( axis ) => axis.value )
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
