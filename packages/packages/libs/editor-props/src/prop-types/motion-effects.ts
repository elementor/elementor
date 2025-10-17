import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { motionEffectPropTypeUtil } from './motion-effect';

export const motionEffectsPropTypeUtil = createPropUtils(
	'motion-effects',
	z.array(motionEffectPropTypeUtil.schema)
);

export type MotionEffectsPropValue = z.infer<typeof motionEffectsPropTypeUtil.schema>; 