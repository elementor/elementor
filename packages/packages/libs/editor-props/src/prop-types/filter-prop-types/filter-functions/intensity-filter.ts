import { z } from '@elementor/schema';

import { createPropUtils } from '../../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../../utils';

export const intensityFilterPropTypeUtil = createPropUtils(
	'intensity',
	z.strictObject( {
		size: unknownChildrenSchema,
	} )
);
