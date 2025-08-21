import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { stringPropTypeUtil } from '../string';
import { dropShadowFilterPropTypeUtil } from './drop-shadow-filter';
import { blurFilterPropTypeUtil } from './filter-functions/blur-filter';
import { colorToneFilterPropTypeUtil } from './filter-functions/color-tone-filter';
import { hueRotateFilterPropTypeUtil } from './filter-functions/hue-rotate-filter';
import { intensityFilterPropTypeUtil } from './filter-functions/intensity-filter';

const filterTypes = blurFilterPropTypeUtil.schema
	.or( colorToneFilterPropTypeUtil.schema )
	.or( hueRotateFilterPropTypeUtil.schema )
	.or( intensityFilterPropTypeUtil.schema )
	.or( dropShadowFilterPropTypeUtil.schema );

export const cssFilterFunctionPropUtil = createPropUtils(
	'css-filter-func',
	z.object( {
		func: stringPropTypeUtil.schema,
		args: filterTypes,
	} )
);

export const filterPropTypeUtil = createPropUtils( 'filter', z.array( cssFilterFunctionPropUtil.schema ) );

export type FilterItemPropValue = z.infer< typeof cssFilterFunctionPropUtil.schema >;

export type FilterPropValue = z.infer< typeof filterPropTypeUtil.schema >;
