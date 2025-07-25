import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { colorPropTypeUtil } from '../color';
import { sizePropTypeUtil } from '../size';

export const dropShadowFilterPropTypeUtil = createPropUtils(
	'drop-shadow',
	z.object( {
		xAxis: sizePropTypeUtil.schema,
		yAxis: sizePropTypeUtil.schema,
		blur: sizePropTypeUtil.schema,
		color: colorPropTypeUtil.schema,
	} )
);

export type DropShadowFilterPropValue = z.infer< typeof dropShadowFilterPropTypeUtil.schema >;
