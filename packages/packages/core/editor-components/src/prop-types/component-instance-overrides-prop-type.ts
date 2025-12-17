import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { componentInstanceOverridePropTypeUtil } from './component-instance-override-prop-type';

export const componentInstanceOverridesPropTypeUtil = createPropUtils(
	'overrides',
	z.array( componentInstanceOverridePropTypeUtil.schema ).optional().default( [] )
);

export type ComponentInstanceOverridesPropValue = z.infer<
	typeof componentInstanceOverridesPropTypeUtil.schema
>[ 'value' ];
