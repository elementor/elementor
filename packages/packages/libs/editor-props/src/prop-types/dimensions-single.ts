import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const dimensionsSinglePropTypeUtil = createPropUtils(
	'dimensions-single',
	z.strictObject( {
		size: unknownChildrenSchema,
	} )
);

export type DimensionsSinglePropValue = z.infer< typeof dimensionsSinglePropTypeUtil.schema >;
