import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const perspectiveOriginPropTypeUtil = createPropUtils(
	'perspective-origin',
	z.strictObject( {
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
	} )
);

export type PerspectiveOriginPropValue = z.infer< typeof perspectiveOriginPropTypeUtil.schema >;
