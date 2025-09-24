import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { keyValuePropTypeUtil } from './key-value';
import { stringPropTypeUtil } from './string';
import { unknownChildrenSchema } from './utils';

export const selectionSizePropTypeUtil = createPropUtils(
	'selection-size',
	z.strictObject( {
		selection: z.union( [ keyValuePropTypeUtil.schema, stringPropTypeUtil.schema ] ),
		size: unknownChildrenSchema,
	} )
);

export type SelectionSizePropValue = z.infer< typeof selectionSizePropTypeUtil.schema >;
