import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { interactionItemPropTypeUtil } from './interaction-item';

export const interactionsPropTypeUtil = createPropUtils(
	'interactions',
	z.array( interactionItemPropTypeUtil.schema )
);

export type InteractionsPropValue = z.infer< typeof interactionsPropTypeUtil.schema >;
