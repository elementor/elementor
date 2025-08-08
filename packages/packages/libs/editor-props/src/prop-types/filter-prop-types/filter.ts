import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { sizePropTypeUtil } from '../size';
import { stringPropTypeUtil } from '../string';
import { dropShadowFilterPropTypeUtil } from './drop-shadow-filter';
import { unknownChildrenSchema } from '../utils';

export const cssFilterFunctionPropUtil = createPropUtils(
	'css-filter-func',
	z.object( {
		func: stringPropTypeUtil.schema,
		args: z.union( [ sizePropTypeUtil.schema, dropShadowFilterPropTypeUtil.schema, unknownChildrenSchema ] ),
	} )
);

export const filterPropTypeUtil = createPropUtils( 'filter', z.array( cssFilterFunctionPropUtil.schema ) );

export type FilterPropValue = z.infer< typeof filterPropTypeUtil.schema >;

export type FilterItemPropValue = z.infer< typeof cssFilterFunctionPropUtil.schema >;
