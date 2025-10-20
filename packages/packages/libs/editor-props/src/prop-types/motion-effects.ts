import { type z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const motionEffectsPropTypeUtil = createPropUtils(
	'motion-effects',
	unknownChildrenSchema
);

export type MotionEffectsPropValue = z.infer<typeof motionEffectsPropTypeUtil.schema>; 