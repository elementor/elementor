import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const queryPropTypeUtil = createPropUtils(
	'query',
	z.strictObject( {
		id: unknownChildrenSchema,
		label: unknownChildrenSchema,
	} )
);

export type QueryPropValue = z.infer< typeof queryPropTypeUtil.schema >;
