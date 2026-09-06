import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const iconPropTypeUtil = createPropUtils(
	'icon',
	z.strictObject( {
		value: unknownChildrenSchema,
		library: unknownChildrenSchema,
	} )
);

export type IconPropValue = z.infer< typeof iconPropTypeUtil.schema >;
