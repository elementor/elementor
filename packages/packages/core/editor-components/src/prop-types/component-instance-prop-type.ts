import { createPropUtils, numberPropTypeUtil } from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { componentInstanceOverridesPropTypeUtil } from './component-instance-overrides-prop-type';

export const componentInstancePropTypeUtil = createPropUtils(
	'component-instance',
	z.object( {
		component_id: numberPropTypeUtil.schema,
		overrides: z.optional( componentInstanceOverridesPropTypeUtil.schema ),
	} )
);

export type ComponentInstanceProp = z.infer< typeof componentInstancePropTypeUtil.schema >;
export type ComponentInstancePropValue = ComponentInstanceProp[ 'value' ];
