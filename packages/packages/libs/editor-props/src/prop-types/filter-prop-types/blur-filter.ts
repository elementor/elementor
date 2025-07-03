import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const blurFilterPropTypeUtil = createPropUtils( 'blur', unknownChildrenSchema );

export type BlurFilterPropValue = z.infer< typeof blurFilterPropTypeUtil.schema >;
