import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const keyValuePropTypeUtil = createPropUtils(
	'key-value',
	z.strictObject( {
		key: unknownChildrenSchema,
		value: unknownChildrenSchema,
	} )
);

export type KeyValuePropValue = z.infer< typeof keyValuePropTypeUtil.schema >;
