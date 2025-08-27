import * as React from 'react';
import { type DropShadowFilterPropValue, type FilterItemPropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';

export const DropShadowItemLabel = ( { value }: { value: FilterItemPropValue } ) => {
	const { xAxis, yAxis, blur } = value.value.args.value as DropShadowFilterPropValue[ 'value' ];

	const xValue = `${ xAxis?.value?.size ?? 0 }${ xAxis?.value?.unit ?? 'px' }`;
	const yValue = `${ yAxis?.value?.size ?? 0 }${ yAxis?.value?.unit ?? 'px' }`;
	const blurValue = `${ blur?.value?.size ?? 10 }${ blur?.value?.unit ?? 'px' }`;

	return (
		<Box component="span">
			<Box component="span" style={ { textTransform: 'capitalize' } }>
				Drop shadow:
			</Box>
			{ `${ xValue } ${ yValue } ${ blurValue }` }
		</Box>
	);
};
