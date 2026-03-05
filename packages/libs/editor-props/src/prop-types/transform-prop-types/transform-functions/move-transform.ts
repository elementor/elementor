import { z } from '@elementor/schema';

import { createPropUtils } from '../../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../../utils';
import { TransformFunctionKeys } from '../types';

export const moveTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.move,
	z.strictObject( {
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
		z: unknownChildrenSchema,
	} )
);

export type MoveTransformPropValue = z.infer< typeof moveTransformPropTypeUtil.schema >;
