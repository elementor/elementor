import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { sizePropTypeUtil } from '../size';
import { stringPropTypeUtil } from '../string';
import { dropShadowFilterPropTypeUtil } from './drop-shadow-filter';

export const cssFunctionPropUtil = createPropUtils(
	'css-func',
	z.object( {
		func: stringPropTypeUtil.schema,
		args: z.union( [ sizePropTypeUtil.schema, dropShadowFilterPropTypeUtil.schema ] ),
	} )
);

export const filterPropTypeUtil = createPropUtils( 'filter', z.array( cssFunctionPropUtil.schema ) );

export type FilterPropValue = z.infer< typeof filterPropTypeUtil.schema >;

export type FilterItemPropValue = z.infer< typeof cssFunctionPropUtil.schema >;
