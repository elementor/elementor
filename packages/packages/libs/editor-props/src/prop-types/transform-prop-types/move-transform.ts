import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { sizePropTypeUtil } from '../size';

export const moveTransformPropTypeUtil = createPropUtils(
	'transform-move',
	z.strictObject( {
		x: sizePropTypeUtil.schema.nullable(),
		y: sizePropTypeUtil.schema.nullable(),
		z: sizePropTypeUtil.schema.nullable(),
	} )
);

export type MoveTransformPropValue = z.infer< typeof moveTransformPropTypeUtil.schema >;
