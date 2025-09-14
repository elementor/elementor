import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const positionPropTypeUtil = createPropUtils(
	'object-position',
	z.strictObject( {
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
	} )
);

export type PositionPropTypeValue = z.infer< typeof positionPropTypeUtil.schema >;
