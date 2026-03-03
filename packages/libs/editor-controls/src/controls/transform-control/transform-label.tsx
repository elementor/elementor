import * as React from 'react';
import type { TransformFunctionsItemPropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { CUSTOM_SIZE_LABEL } from '../size-control';
import { defaultValues, TransformFunctionKeys } from './initial-values';

const orderedAxis = [ 'x', 'y', 'z' ];

const formatLabel = ( value: TransformFunctionsItemPropValue[ 'value' ], functionType: keyof typeof defaultValues ) => {
	return orderedAxis
		.map( ( axisKey ) => {
			const axis = value[ axisKey as keyof typeof value ];

			if ( functionType === 'scale' ) {
				return axis?.value || defaultValues[ functionType ];
			}

			const defaults = defaultValues[ functionType ];
			const size = axis?.value?.size ?? defaults.size;
			const unit = axis?.value?.unit ?? defaults.unit;

			return unit === 'custom' ? size || CUSTOM_SIZE_LABEL : `${ size }${ unit }`;
		} )
		.join( ', ' );
};

export const TransformLabel = ( props: { value: TransformFunctionsItemPropValue } ) => {
	const { $$type, value } = props.value;
	switch ( $$type ) {
		case TransformFunctionKeys.move:
			return <Label label={ __( 'Move', 'elementor' ) } value={ formatLabel( value, 'move' ) } />;
		case TransformFunctionKeys.scale:
			return <Label label={ __( 'Scale', 'elementor' ) } value={ formatLabel( value, 'scale' ) } />;
		case TransformFunctionKeys.rotate:
			return <Label label={ __( 'Rotate', 'elementor' ) } value={ formatLabel( value, 'rotate' ) } />;
		case TransformFunctionKeys.skew:
			return <Label label={ __( 'Skew', 'elementor' ) } value={ formatLabel( value, 'skew' ) } />;
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
