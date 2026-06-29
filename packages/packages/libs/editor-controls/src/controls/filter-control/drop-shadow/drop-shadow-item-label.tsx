import * as React from 'react';
import { type DropShadowFilterPropValue, type FilterItemPropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { CUSTOM_SIZE_LABEL } from '../../size-control';

export const DropShadowItemLabel = ( { value }: { value: FilterItemPropValue } ) => {
	const values = value.value.args.value as DropShadowFilterPropValue[ 'value' ];
	const keys = [ 'xAxis', 'yAxis', 'blur' ] as Array< keyof typeof values >;
	const labels: string[] = keys.map( ( key ) =>
		values[ key ]?.value?.unit !== 'custom'
			? `${ values[ key ]?.value?.size ?? 0 }${ values[ key ]?.value?.unit ?? 'px' }`
			: values[ key ]?.value?.size || CUSTOM_SIZE_LABEL
	);

	return (
		<Box component="span">
			<Box component="span" style={ { textTransform: 'capitalize' } }>
				{ __( 'Drop shadow:', 'elementor' ) }
			</Box>
			{ ` ${ labels.join( ' ' ) }` }
		</Box>
	);
};
