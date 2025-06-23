import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const backgroundPropTypeUtil = createPropUtils(
	'background',
	z.strictObject( {
		color: unknownChildrenSchema,
		'background-overlay': unknownChildrenSchema,
	} )
);

export type BackgroundPropValue = z.infer< typeof backgroundPropTypeUtil.schema >;
