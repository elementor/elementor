import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const transformPropTypeUtil = createPropUtils(
	'transform',
	z.strictObject( {
		'transform-functions': unknownChildrenSchema,
		'transform-origin': unknownChildrenSchema,
		perspective: unknownChildrenSchema,
	} )
);

export type TransformPropValue = z.infer< typeof transformPropTypeUtil.schema >;
