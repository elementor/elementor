import type { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const backgroundGradientOverlayPropTypeUtil = createPropUtils(
	'background-gradient-overlay',
	unknownChildrenSchema
);

export type BackgroundGradientOverlayPropValue = z.infer< typeof backgroundGradientOverlayPropTypeUtil.schema >;
