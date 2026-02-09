import { createPropUtils, stringPropTypeUtil } from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { animationPropTypeUtil } from './animation';

export const interactionItemPropTypeUtil = createPropUtils(
	'interaction-item',
	z.object( {
		id: stringPropTypeUtil.schema,
		trigger: stringPropTypeUtil.schema,
		animation: animationPropTypeUtil.schema,
	} )
);

export type InteractionsItemPropValue = z.infer< typeof interactionItemPropTypeUtil.schema >;
