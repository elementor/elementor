import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

export const componentOverridablePropTypeUtil = createPropUtils(
	'overridable',
	z.object( {
		override_key: z.string(),
		default_value: z
			.object( {
				$$type: z.string(),
				value: z.unknown(),
			} )
			.nullable(),
	} )
);
