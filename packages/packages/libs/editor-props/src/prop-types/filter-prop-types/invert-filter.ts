import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const invertFilterPropTypeUtil = createPropUtils( 'invert', unknownChildrenSchema );

export type InvertFilterPropValue = z.infer< typeof invertFilterPropTypeUtil.schema >;
