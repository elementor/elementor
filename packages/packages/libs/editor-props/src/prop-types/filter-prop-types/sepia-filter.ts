import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const sepiaFilterPropTypeUtil = createPropUtils( 'sepia', unknownChildrenSchema );

export type SepiaFilterPropValue = z.infer< typeof sepiaFilterPropTypeUtil.schema >;
