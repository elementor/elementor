import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const flexPropTypeUtil = createPropUtils(
	'flex',
	z.strictObject( {
		flexGrow: unknownChildrenSchema,
		flexShrink: unknownChildrenSchema,
		flexBasis: unknownChildrenSchema,
	} )
);

export type FlexPropValue = z.infer< typeof flexPropTypeUtil.schema >;
