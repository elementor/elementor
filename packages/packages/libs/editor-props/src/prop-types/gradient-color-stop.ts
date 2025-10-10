import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { colorStopPropTypeUtil } from './color-stop';

export const gradientColorStopPropTypeUtil = createPropUtils(
	'gradient-color-stop',
	z.array( colorStopPropTypeUtil.schema )
);

export type GradientColorStopPropValue = z.infer< typeof gradientColorStopPropTypeUtil.schema >;
