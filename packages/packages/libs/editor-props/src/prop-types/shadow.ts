import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const shadowPropTypeUtil = createPropUtils(
	'shadow',
	z.strictObject( {
		position: unknownChildrenSchema,
		hOffset: unknownChildrenSchema,
		vOffset: unknownChildrenSchema,
		blur: unknownChildrenSchema,
		spread: unknownChildrenSchema,
		color: unknownChildrenSchema,
	} )
);

export type ShadowPropValue = z.infer< typeof shadowPropTypeUtil.schema >;
