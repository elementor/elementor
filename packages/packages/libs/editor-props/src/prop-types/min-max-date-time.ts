import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const minMaxDateTimePropTypeUtil = createPropUtils(
	'min-max-date-time',
	z.strictObject( {
		min: unknownChildrenSchema,
		max: unknownChildrenSchema,
	} )
);

export type MinMaxDateTimePropValue = z.infer< typeof minMaxDateTimePropTypeUtil.schema >;
