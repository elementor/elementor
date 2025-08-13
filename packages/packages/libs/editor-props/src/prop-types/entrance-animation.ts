import { type z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const entranceAnimationPropTypeUtil = createPropUtils(
	'entrance-animation',
	unknownChildrenSchema
);

export type EntranceAnimationPropValue = z.infer<typeof entranceAnimationPropTypeUtil.schema>; 