import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const imageSrcPropTypeUtil = createPropUtils(
	'image-src',
	z
		.strictObject( {
			id: unknownChildrenSchema,
			url: z.null(),
		} )
		.or(
			z.strictObject( {
				id: z.null(),
				url: unknownChildrenSchema,
			} )
		)
);

export type ImageSrcPropValue = z.infer< typeof imageSrcPropTypeUtil.schema >;
