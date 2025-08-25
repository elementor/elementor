import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const svgSrcPropTypeUtil = createPropUtils(
	'svg',
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

export type SvgSrcPropValue = z.infer< typeof svgSrcPropTypeUtil.schema >;
