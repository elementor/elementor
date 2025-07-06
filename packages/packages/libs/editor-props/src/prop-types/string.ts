import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const stringPropTypeUtil = createPropUtils( 'string', z.string().nullable() );

export type StringPropValue = z.infer< typeof stringPropTypeUtil.schema >;
