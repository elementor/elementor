import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const videoSrcPropTypeUtil = createPropUtils(
	'video-src',
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

export type VideoSrcPropValue = z.infer< typeof videoSrcPropTypeUtil.schema >;
