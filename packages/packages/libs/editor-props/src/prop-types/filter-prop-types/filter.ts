import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { stringPropTypeUtil } from '../string';
import { unknownChildrenSchema } from '../utils';

export const cssFilterFunctionPropUtil = createPropUtils(
	'css-filter-func',
	z.object( {
		func: stringPropTypeUtil.schema,
		args: unknownChildrenSchema,
	} )
);

export const filterPropTypeUtil = createPropUtils( 'filter', z.array( cssFilterFunctionPropUtil.schema ) );

export type FilterPropValue = z.infer< typeof filterPropTypeUtil.schema >;

export type FilterItemPropValue = z.infer< typeof cssFilterFunctionPropUtil.schema >;
