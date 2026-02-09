import { booleanPropTypeUtil, createPropUtils, sizePropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { z } from '@elementor/schema';

export const configPropTypeUtil = createPropUtils(
	'config',
	z.object( {
		replay: booleanPropTypeUtil.schema,
		easing: stringPropTypeUtil.schema,
		'relative-to': stringPropTypeUtil.schema,
		'offset-top': sizePropTypeUtil.schema,
		'offset-bottom': sizePropTypeUtil.schema,
	} )
);
