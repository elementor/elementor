import { z } from '@elementor/schema';

import { createArrayPropUtils, createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const queryFilterPropTypeUtil = createPropUtils(
	'query-filter',
	z.strictObject( {
		key: unknownChildrenSchema,
		values: unknownChildrenSchema,
	} )
);

export type QueryFilterPropValue = z.infer< typeof queryFilterPropTypeUtil.schema >;

export const queryFilterArrayPropTypeUtil = createArrayPropUtils(
	queryFilterPropTypeUtil.key,
	queryFilterPropTypeUtil.schema
);

export type QueryFilterKeyConfig = {
	label: string;
	queryEndpoint?: {
		url: string;
		params?: Record< string, unknown >;
	} | null;
	chipsPlaceholder?: string;
};
