import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const dropShadowFilterPropTypeUtil = createPropUtils(
	'drop-shadow',
	z.object( {
		xAxis: unknownChildrenSchema,
		yAxis: unknownChildrenSchema,
		blur: unknownChildrenSchema,
		color: unknownChildrenSchema,
	} )
);

export type DropShadowFilterPropValue = z.infer< typeof dropShadowFilterPropTypeUtil.schema >;
