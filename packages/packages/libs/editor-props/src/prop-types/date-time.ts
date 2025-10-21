import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const DateTimePropTypeUtil = createPropUtils(
	'key-value',
	z.strictObject( {
		date: unknownChildrenSchema,
		time: unknownChildrenSchema,
	} )
);

export type DateTimeePropValue = z.infer< typeof DateTimePropTypeUtil.schema >;
