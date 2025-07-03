import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const hueRotateFilterPropTypeUtil = createPropUtils( 'hue-rotate', unknownChildrenSchema );

export type HueRotateFilterPropValue = z.infer< typeof hueRotateFilterPropTypeUtil.schema >;
