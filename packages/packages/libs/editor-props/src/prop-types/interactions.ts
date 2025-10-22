import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { interactionPropTypeUtil } from './interaction';

export const interactionsPropTypeUtil = createPropUtils(
	'interactions',
	z.array(interactionPropTypeUtil.schema).default([])
);

export type interactionsPropValue = z.infer<typeof interactionsPropTypeUtil.schema>; 