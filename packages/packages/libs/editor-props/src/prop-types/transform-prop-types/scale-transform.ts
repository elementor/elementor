import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { numberPropTypeUtil } from '../number';
import { TransformFunctionKeys } from './types';

export const scaleTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.scale,
	z.strictObject( {
		x: numberPropTypeUtil.schema.nullable(),
		y: numberPropTypeUtil.schema.nullable(),
		z: numberPropTypeUtil.schema.nullable(),
	} )
);

export type ScaleTransformPropValue = z.infer< typeof scaleTransformPropTypeUtil.schema >;
