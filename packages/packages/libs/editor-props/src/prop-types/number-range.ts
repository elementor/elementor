import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const numberRangePropTypeUtil = createPropUtils(
	'number-range',
	z.strictObject( {
		min: unknownChildrenSchema,
		max: unknownChildrenSchema,
	} )
);

export type NumberRangePropValue = z.infer< typeof numberRangePropTypeUtil.schema >;
