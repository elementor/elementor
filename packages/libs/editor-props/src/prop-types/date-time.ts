import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const DateTimePropTypeUtil = createPropUtils(
	'date-time',
	z.strictObject( {
		date: unknownChildrenSchema,
		time: unknownChildrenSchema,
	} )
);

export type DateTimePropValue = z.infer< typeof DateTimePropTypeUtil.schema >;
