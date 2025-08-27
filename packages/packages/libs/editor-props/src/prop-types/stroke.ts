import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const strokePropTypeUtil = createPropUtils(
	'stroke',
	z.strictObject( {
		color: unknownChildrenSchema,
		width: unknownChildrenSchema,
	} )
);

export type StrokePropValue = z.infer< typeof strokePropTypeUtil.schema >;
