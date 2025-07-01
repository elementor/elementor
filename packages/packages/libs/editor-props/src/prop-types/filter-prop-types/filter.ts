import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { blurFilterPropTypeUtil } from './blur-filter';
import { brightnessFilterPropTypeUtil } from './brightness-filter';
import { contrastFilterPropTypeUtil } from './contrast-filter';
import { grayscaleFilterPropTypeUtil } from './grayscale-filter';
import { hueRotateFilterPropTypeUtil } from './hue-rotate-filter';
import { invertFilterPropTypeUtil } from './invert-filter';
import { saturateFilterPropTypeUtil } from './saturate-filter';
import { sepiaFilterPropTypeUtil } from './sepia-filter';

const filterTypes = blurFilterPropTypeUtil.schema
	.or( brightnessFilterPropTypeUtil.schema )
	.or( contrastFilterPropTypeUtil.schema )
	.or( grayscaleFilterPropTypeUtil.schema )
	.or( invertFilterPropTypeUtil.schema )
	.or( saturateFilterPropTypeUtil.schema )
	.or( sepiaFilterPropTypeUtil.schema )
	.or( hueRotateFilterPropTypeUtil.schema );
export const filterPropTypeUtil = createPropUtils( 'filter', z.array( filterTypes ) );

export type FilterPropValue = z.infer< typeof filterPropTypeUtil.schema >;

export type FilterItemPropValue = z.infer< typeof filterTypes >;
