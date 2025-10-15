import { z } from '@elementor/schema';

import { createPropUtils } from '../../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../../utils';
import { TransformFunctionKeys } from '../types';

export const skewTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.skew,
	z.strictObject( {
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
	} )
);

export type SkewTransformPropValue = z.infer< typeof skewTransformPropTypeUtil.schema >;
