import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const timeRangePropTypeUtil = createPropUtils(
	'time-range',
	z.strictObject( {
		min: unknownChildrenSchema,
		max: unknownChildrenSchema,
	} )
);

export type TimeRangePropValue = z.infer< typeof timeRangePropTypeUtil.schema >;
