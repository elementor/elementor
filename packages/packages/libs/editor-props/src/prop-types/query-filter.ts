import { z } from '@elementor/schema';

import { createArrayPropUtils, createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const queryFilterPropTypeUtil = createPropUtils(
	'query-filter',
	z.strictObject( {
		type: unknownChildrenSchema,
		value: unknownChildrenSchema,
	} )
);

export type QueryFilterPropValue = z.infer< typeof queryFilterPropTypeUtil.schema >;

export const queryFilterArrayPropTypeUtil = createArrayPropUtils(
	queryFilterPropTypeUtil.key,
	queryFilterPropTypeUtil.schema
);
