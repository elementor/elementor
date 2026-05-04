import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const lengthRangePropTypeUtil = createPropUtils(
	'length-range',
	z.strictObject( {
		min: unknownChildrenSchema,
		max: unknownChildrenSchema,
	} )
);

export type LengthRangePropValue = z.infer< typeof lengthRangePropTypeUtil.schema >;
