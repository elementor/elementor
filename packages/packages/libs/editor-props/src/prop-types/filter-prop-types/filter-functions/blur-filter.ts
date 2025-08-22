import { z } from '@elementor/schema';

import { createPropUtils } from '../../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../../utils';

export const blurFilterPropTypeUtil = createPropUtils(
	'blur',
	z.strictObject( {
		size: unknownChildrenSchema,
	} )
);
