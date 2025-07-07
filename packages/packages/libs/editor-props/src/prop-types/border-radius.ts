import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const borderRadiusPropTypeUtil = createPropUtils(
	'border-radius',
	z.strictObject( {
		'start-start': unknownChildrenSchema,
		'start-end': unknownChildrenSchema,
		'end-start': unknownChildrenSchema,
		'end-end': unknownChildrenSchema,
	} )
);

export type BorderRadiusPropValue = z.infer< typeof borderRadiusPropTypeUtil.schema >;
