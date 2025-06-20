import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { sizePropTypeUtil } from './size';

export const positionPropTypeUtil = createPropUtils(
	'object-position',
	z.strictObject( {
		x: sizePropTypeUtil.schema.nullable(),
		y: sizePropTypeUtil.schema.nullable(),
	} )
);

export type PositionPropTypeValue = z.infer< typeof positionPropTypeUtil.schema >;
