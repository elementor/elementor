import * as React from 'react';
import type { FilterItemPropValue, SizePropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';

import { lengthUnits } from '../../../utils/size-control';
import { type FilterFunction } from '../configs';
import { useFilterConfig } from '../context/filter-config-context';

export const SingleSizeItemLabel = ( { value }: { value: FilterItemPropValue } ) => {
	const { func, args } = value.value;
	const { getFilterFunctionConfig } = useFilterConfig();
	const { defaultValue } = getFilterFunctionConfig( ( func.value ?? '' ) as FilterFunction );
	const defaultUnit =
		( defaultValue.value.args.value as { size: SizePropValue } )?.size?.value?.unit ?? lengthUnits[ 0 ];

	const { unit, size } = ( args.value as { size: SizePropValue } ).size?.value ?? { unit: defaultUnit, size: 0 };

	const label = (
		<Box component="span" style={ { textTransform: 'capitalize' } }>
			{ func.value ?? '' }:
		</Box>
	);

	return (
		<Box component="span">
			{ label }
			{ unit !== 'custom' ? ` ${ size ?? 0 }${ unit ?? defaultUnit }` : size }
		</Box>
	);
};
