import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const dimensionsPropTypeUtil = createPropUtils(
	'dimensions',
	z.strictObject( {
		'block-start': unknownChildrenSchema,
		'block-end': unknownChildrenSchema,
		'inline-start': unknownChildrenSchema,
		'inline-end': unknownChildrenSchema,
	} )
);

export type DimensionsPropValue = z.infer< typeof dimensionsPropTypeUtil.schema >;
