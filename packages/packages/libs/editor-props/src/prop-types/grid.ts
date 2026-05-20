import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const gridPropTypeUtil = createPropUtils(
	'grid',
	z.strictObject( {
		columnsCount: unknownChildrenSchema,
		rowsCount: unknownChildrenSchema,
		columnsTemplate: unknownChildrenSchema,
		rowsTemplate: unknownChildrenSchema,
		columnGap: unknownChildrenSchema,
		rowGap: unknownChildrenSchema,
		autoFlow: unknownChildrenSchema,
		showOutline: unknownChildrenSchema.optional(),
	} )
);

export type GridPropValue = z.infer< typeof gridPropTypeUtil.schema >;
