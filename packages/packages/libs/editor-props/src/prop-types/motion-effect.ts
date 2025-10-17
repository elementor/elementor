import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

// Individual motion effect schema
const motionEffectSchema = z.strictObject({
	trigger: z.enum(['scroll-into-view', 'scroll-out-of-view']),
	animation: z.enum(['fade', 'scale', 'slide']),
	type: z.enum(['in', 'out']),
	direction: z.enum(['up', 'down', 'left', 'right']),
});

export const motionEffectPropTypeUtil = createPropUtils(
	'motion-effect',
	motionEffectSchema
);

export type MotionEffectPropValue = z.infer<typeof motionEffectPropTypeUtil.schema>;
