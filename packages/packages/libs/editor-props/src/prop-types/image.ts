import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const imagePropTypeUtil = createPropUtils(
	'image',
	z.strictObject( {
		src: unknownChildrenSchema,
		size: unknownChildrenSchema,
	} )
);

export type ImagePropValue = z.infer< typeof imagePropTypeUtil.schema >;
