import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

export const componentInstanceOverridePropTypeUtil = createPropUtils(
	'override',
	z.object( {
		override_key: z.string(),
		override_value: z.unknown(),
		schema_source: z.object( {
			type: z.literal( 'component' ),
			id: z.number(),
		} ),
	} )
);

export type ComponentInstanceOverrideProp = z.infer< typeof componentInstanceOverridePropTypeUtil.schema >;

export type ComponentInstanceOverridePropValue = ComponentInstanceOverrideProp[ 'value' ];
