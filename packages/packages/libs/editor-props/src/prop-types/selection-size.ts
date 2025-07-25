import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { keyValuePropTypeUtil } from './key-value';
import { sizePropTypeUtil } from './size';

export const selectionSizePropTypeUtil = createPropUtils(
	'selection-size',
	z.strictObject( {
		selection: keyValuePropTypeUtil.schema,
		size: sizePropTypeUtil.schema,
	} )
);

export type SelectionSizePropValue = z.infer< typeof selectionSizePropTypeUtil.schema >;
