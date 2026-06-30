import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const backgroundImageSizeScalePropTypeUtil = createPropUtils(
	'background-image-size-scale',
	unknownChildrenSchema
);

export type BackgroundImageSizeScalePropValue = z.infer< typeof backgroundImageSizeScalePropTypeUtil.schema >;
