import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { componentInstanceOverridePropTypeUtil } from './component-instance-override-prop-type';
import { componentOverridablePropTypeUtil } from './component-overridable-prop-type';

export const componentInstanceOverridesPropTypeUtil = createPropUtils(
	'overrides',
	z
		.array( z.union( [ componentInstanceOverridePropTypeUtil.schema, componentOverridablePropTypeUtil.schema ] ) )
		.optional()
		.default( [] )
);

export type ComponentInstanceOverridesPropValue = z.infer<
	typeof componentInstanceOverridesPropTypeUtil.schema
>[ 'value' ];
