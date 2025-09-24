import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const transformOriginPropTypeUtil = createPropUtils(
	'transform-origin',
	z.strictObject( {
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
		z: unknownChildrenSchema,
	} )
);

export type TransformOriginPropValue = z.infer< typeof transformOriginPropTypeUtil.schema >;
