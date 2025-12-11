import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

export const componentInstancePropTypeUtil = createPropUtils(
	'component-instance',
	z.object( {
		component_id: z.unknown(),
	} )
);

export type ComponentOverridablePropValue = z.infer< typeof componentInstancePropTypeUtil.schema >[ 'value' ];
