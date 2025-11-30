import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

export const componentOverridablePropTypeUtil = createPropUtils(
	'component-overridable',
	z.object( {
		override_key: z.string(),
		default_value: z.any().nullable(),
	} )
);

export type ComponentOverridablePropValue = z.infer< typeof componentOverridablePropTypeUtil.schema >[ 'value' ];
