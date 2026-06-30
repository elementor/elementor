import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

const sizeNumberOrEmpty = z.union( [ z.number(), z.literal( '' ) ] );

// NOTE: The schema differs from the PHP schema, check size-prop-type.php for the actual schema.
export const sizePropTypeUtil = createPropUtils(
	'size',
	z
		.strictObject( {
			unit: z.enum( [ 'px', 'em', 'rem', '%', 'vw', 'vh', 'ch' ] ),
			size: sizeNumberOrEmpty,
		} )
		.or(
			z.strictObject( {
				unit: z.enum( [ 'deg', 'rad', 'grad', 'turn' ] ),
				size: sizeNumberOrEmpty,
			} )
		)
		.or(
			z.strictObject( {
				unit: z.enum( [ 's', 'ms' ] ),
				size: sizeNumberOrEmpty,
			} )
		)
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
