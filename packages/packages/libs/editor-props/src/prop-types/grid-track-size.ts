import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const gridTrackSizePropTypeUtil = createPropUtils(
	'grid-track-size',
	z
		.strictObject( {
			unit: z.literal( 'fr' ),
			size: z.union( [ z.number(), z.literal( '' ) ] ),
		} )
		.or(
			z.strictObject( {
				unit: z.literal( 'custom' ),
				size: z.string(),
			} )
		)
);

export type GridTrackSizePropValue = z.infer< typeof gridTrackSizePropTypeUtil.schema >;
