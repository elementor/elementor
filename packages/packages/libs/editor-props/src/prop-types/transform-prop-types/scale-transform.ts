import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { numberPropTypeUtil } from '../number';
import { TransformFunctionKeys } from './types';

export const scaleTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.scale,
	z.strictObject( {
		x: numberPropTypeUtil.schema.default( { value: 1, $$type: 'number' } ).nullable(),
		y: numberPropTypeUtil.schema.default( { value: 1, $$type: 'number' } ).nullable(),
		z: numberPropTypeUtil.schema.default( { value: 1, $$type: 'number' } ).nullable(),
	} )
);

export type ScaleTransformPropValue = z.infer< typeof scaleTransformPropTypeUtil.schema >;
