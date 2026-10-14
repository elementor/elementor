import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { shadowPropTypeUtil } from './shadow';

export const boxShadowPropTypeUtil = createPropUtils( 'box-shadow', z.array( shadowPropTypeUtil.schema ) );

export type BoxShadowPropValue = z.infer< typeof boxShadowPropTypeUtil.schema >;
