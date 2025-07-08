import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { numberPropTypeUtil } from '../number';
import { TransformFunctionKeys } from './types';

export const scaleTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.scale,
	z.strictObject( {
		x: numberPropTypeUtil.schema.default( 1 ),
		y: numberPropTypeUtil.schema.default( 1 ),
		z: numberPropTypeUtil.schema.default( 1 ),
	} )
);

export type ScaleTransformPropValue = z.infer< typeof scaleTransformPropTypeUtil.schema >;
