import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const booleanPropTypeUtil = createPropUtils( 'boolean', z.boolean().nullable() );

export type BooleanPropValue = z.infer< typeof booleanPropTypeUtil.schema >;
