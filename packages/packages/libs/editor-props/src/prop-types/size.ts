import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const sizePropTypeUtil = createPropUtils(
	'size',
	z
		.strictObject( {
			unit: z.enum( [ 'px', 'em', 'rem', '%', 'vw', 'vh', 'deg', 'rad', 'grad', 'turn' ] ),
			size: z.number(),
		} )
		.or(
			z.strictObject( {
				unit: z.literal( 'auto' ),
				size: z.literal( '' ),
			} )
		)
		.or(
			z.strictObject( {
				unit: z.literal( 'custom' ),
				size: z.string(),
			} )
		)
);

export type SizePropValue = z.infer< typeof sizePropTypeUtil.schema >;
