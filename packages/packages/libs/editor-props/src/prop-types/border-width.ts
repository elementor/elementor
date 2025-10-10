import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const borderWidthPropTypeUtil = createPropUtils(
	'border-width',
	z.strictObject( {
		'block-start': unknownChildrenSchema,
		'block-end': unknownChildrenSchema,
		'inline-start': unknownChildrenSchema,
		'inline-end': unknownChildrenSchema,
	} )
);

export type BorderWidthPropValue = z.infer< typeof borderWidthPropTypeUtil.schema >;
