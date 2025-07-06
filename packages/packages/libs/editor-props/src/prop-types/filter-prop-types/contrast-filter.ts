import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const contrastFilterPropTypeUtil = createPropUtils( 'contrast', unknownChildrenSchema );

export type ContrastFilterPropValue = z.infer< typeof contrastFilterPropTypeUtil.schema >;
