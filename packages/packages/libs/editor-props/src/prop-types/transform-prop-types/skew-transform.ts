import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { sizePropTypeUtil } from '../size';
import { TransformFunctionKeys } from './types';

export const skewTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.skew,
	z.strictObject( {
		x: sizePropTypeUtil.schema.nullable(),
		y: sizePropTypeUtil.schema.nullable(),
	} )
);

export type SkewTransformPropValue = z.infer< typeof skewTransformPropTypeUtil.schema >;
