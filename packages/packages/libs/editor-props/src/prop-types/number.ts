import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const numberPropTypeUtil = createPropUtils( 'number', z.number().nullable() );

export type NumberPropValue = z.infer< typeof numberPropTypeUtil.schema >;
