import { createPropUtils, sizePropTypeUtil } from '@elementor/editor-props';
import { z } from '@elementor/schema';

export const timingConfigPropTypeUtil = createPropUtils(
	'timing-config',
	z.object( {
		duration: sizePropTypeUtil.schema,
		delay: sizePropTypeUtil.schema,
	} )
);
