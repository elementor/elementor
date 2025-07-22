import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const backgroundImagePositionOffsetPropTypeUtil = createPropUtils(
	'background-image-position-offset',
	unknownChildrenSchema
);

export type BackgroundImagePositionOffsetPropValue = z.infer< typeof backgroundImagePositionOffsetPropTypeUtil.schema >;
