import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const brightnessFilterPropTypeUtil = createPropUtils( 'brightness', unknownChildrenSchema );

export type BrightnessFilterPropValue = z.infer< typeof brightnessFilterPropTypeUtil.schema >;
