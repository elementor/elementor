import { z } from '@elementor/schema';

import { createPropUtils } from '../../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../../utils';
import { TransformFunctionKeys } from '../types';

export const rotateTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.rotate,
	z.strictObject( {
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
		z: unknownChildrenSchema,
	} )
);

export type RotateTransformPropValue = z.infer< typeof rotateTransformPropTypeUtil.schema >;
