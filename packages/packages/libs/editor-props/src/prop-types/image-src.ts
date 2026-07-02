import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const imageSrcPropTypeUtil = createPropUtils(
	'image-src',
	z
		.strictObject( {
			id: unknownChildrenSchema,
			url: z.null(),
			alt: unknownChildrenSchema.optional().default( null ),
		} )
		.or(
			z.strictObject( {
				id: unknownChildrenSchema.optional().default( null ),
				url: unknownChildrenSchema,
				alt: unknownChildrenSchema.optional().default( null ),
			} )
		)
);

export type ImageSrcPropValue = z.infer< typeof imageSrcPropTypeUtil.schema >;
