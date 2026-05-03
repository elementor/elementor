import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const dateRangePropTypeUtil = createPropUtils(
	'date-range',
	z.strictObject( {
		min: unknownChildrenSchema,
		max: unknownChildrenSchema,
	} )
);

export type DateRangePropValue = z.infer< typeof dateRangePropTypeUtil.schema >;
