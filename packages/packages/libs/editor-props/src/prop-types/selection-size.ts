import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { sizePropTypeUtil } from './size';
import { stringPropTypeUtil } from './string';

export const selectionSizePropTypeUtil = createPropUtils(
	'selection-size',
	z.strictObject( {
		selection: stringPropTypeUtil.schema,
		size: sizePropTypeUtil.schema,
	} )
);

export type SelectionSizePropValue = z.infer< typeof selectionSizePropTypeUtil.schema >;
