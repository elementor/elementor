import * as React from 'react';
import { type DropShadowFilterPropValue, type FilterItemPropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';

import { CUSTOM_SIZE_LABEL } from '../../size-control';

export const DropShadowItemLabel = ( { value }: { value: FilterItemPropValue } ) => {
	const { xAxis, yAxis, blur } = value.value.args.value as DropShadowFilterPropValue[ 'value' ];

	const xValue =
		xAxis?.value?.unit !== 'custom'
			? `${ xAxis?.value?.size ?? 0 }${ xAxis?.value?.unit ?? 'px' }`
			: xAxis?.value?.size || CUSTOM_SIZE_LABEL;
	const yValue =
		yAxis?.value?.unit !== 'custom'
			? `${ yAxis?.value?.size ?? 0 }${ yAxis?.value?.unit ?? 'px' }`
			: yAxis?.value?.size || CUSTOM_SIZE_LABEL;
	const blurValue =
		blur?.value?.unit !== 'custom'
			? `${ blur?.value?.size ?? 10 }${ blur?.value?.unit ?? 'px' }`
			: blur?.value?.size || CUSTOM_SIZE_LABEL;

	return (
		<Box component="span">
			<Box component="span" style={ { textTransform: 'capitalize' } }>
				Drop shadow:
			</Box>
			{ ` ${ xValue } ${ yValue } ${ blurValue }` }
		</Box>
	);
};
