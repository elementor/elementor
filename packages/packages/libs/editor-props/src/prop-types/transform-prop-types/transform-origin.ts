import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { sizePropTypeUtil } from '../size';

export const transformOriginPropTypeUtil = createPropUtils(
	'transform-origin',
	z.strictObject( {
		x: sizePropTypeUtil.schema.nullable(),
		y: sizePropTypeUtil.schema.nullable(),
		z: sizePropTypeUtil.schema.nullable(),
	} )
);

export type TransformOriginPropValue = z.infer< typeof transformOriginPropTypeUtil.schema >;
