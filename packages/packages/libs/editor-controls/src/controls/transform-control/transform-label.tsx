import * as React from 'react';
import type { TransformItemPropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const transformMoveValue = ( value: TransformItemPropValue[ 'value' ] ) =>
	Object.values( value )
		.map( ( axis ) => `${ axis?.value.size }${ axis?.value.unit }` )
		.join( ', ' );

export const TransformLabel = ( props: { value: TransformItemPropValue } ) => {
	const { $$type, value } = props.value;
	switch ( $$type ) {
		case 'transform-move':
			return <Label label={ __( 'Move', 'elementor' ) } value={ transformMoveValue( value ) } />;
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
