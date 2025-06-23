import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const colorStopPropTypeUtil = createPropUtils(
	'color-stop',
	z.strictObject( {
		color: unknownChildrenSchema,
		offset: unknownChildrenSchema,
	} )
);

export type ColorStopPropValue = z.infer< typeof colorStopPropTypeUtil.schema >;
