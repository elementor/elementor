import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { sizePropTypeUtil } from '../size';
import { TransformFunctionKeys } from './types';

export const rotateTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.rotate,
	z.strictObject( {
		x: sizePropTypeUtil.schema.nullable(),
		y: sizePropTypeUtil.schema.nullable(),
		z: sizePropTypeUtil.schema.nullable(),
	} )
);

export type RotateTransformPropValue = z.infer< typeof rotateTransformPropTypeUtil.schema >;
