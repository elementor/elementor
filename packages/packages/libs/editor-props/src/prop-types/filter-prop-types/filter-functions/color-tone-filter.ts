import { z } from '@elementor/schema';

import { createPropUtils } from '../../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../../utils';

export const colorToneFilterPropTypeUtil = createPropUtils(
	'color-tone',
	z.strictObject( {
		size: unknownChildrenSchema,
	} )
);
