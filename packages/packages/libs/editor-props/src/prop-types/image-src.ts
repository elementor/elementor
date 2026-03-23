import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

const imageSrcValueSchema = z
	.strictObject( {
		id: unknownChildrenSchema,
		url: z.null(),
	} )
	.or(
		z.strictObject( {
			id: z.null(),
			url: unknownChildrenSchema,
		} )
	);

export const imageSrcPropTypeUtil = createPropUtils( 'image-src', imageSrcValueSchema );

export type ImageSrcPropValue = z.infer< typeof imageSrcValueSchema >;
