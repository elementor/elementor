import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const saturateFilterPropTypeUtil = createPropUtils( 'saturate', unknownChildrenSchema );

export type SaturateFilterPropValue = z.infer< typeof saturateFilterPropTypeUtil.schema >;
