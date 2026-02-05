import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const stringArrayPropTypeUtil = createPropUtils( 'string-array', z.array( z.string() ) );

export type StringArrayPropValue = z.infer< typeof stringArrayPropTypeUtil.schema >;
