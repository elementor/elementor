import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

const svgSrcValueSchema = z
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
	.or(
		z.strictObject( {
			id: unknownChildrenSchema,
			url: unknownChildrenSchema,
		} )
	);

export const svgSrcPropTypeUtil = createPropUtils( 'svg-src', svgSrcValueSchema );

export type SvgSrcPropValue = z.infer< typeof svgSrcValueSchema >;
