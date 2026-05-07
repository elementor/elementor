import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const timeStringPropTypeUtil = createPropUtils( 'time-string', z.string() );

export type TimeStringPropValue = z.infer< typeof timeStringPropTypeUtil.schema >;
