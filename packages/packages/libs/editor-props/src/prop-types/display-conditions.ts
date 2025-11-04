import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const displayConditionsPropTypeUtil = createPropUtils( 'display-conditions', z.array( unknownChildrenSchema ) );

export type DisplayConditionsPropValue = z.infer< typeof displayConditionsPropTypeUtil.schema >;
