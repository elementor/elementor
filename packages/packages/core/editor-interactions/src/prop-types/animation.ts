import { createPropUtils, stringPropTypeUtil } from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { configPropTypeUtil } from './config';
import { timingConfigPropTypeUtil } from './timing-config';

export const animationPropTypeUtil = createPropUtils(
	'animation',
	z.object( {
		effect: stringPropTypeUtil.schema,
		'effect-type': stringPropTypeUtil.schema,
		direction: stringPropTypeUtil.schema,
		'timing-config': timingConfigPropTypeUtil.schema,
		config: configPropTypeUtil.schema,
	} )
);
