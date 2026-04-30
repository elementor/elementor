import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const spanPropTypeUtil = createPropUtils( 'span', z.number().nullable() );

export type SpanPropValue = z.infer< typeof spanPropTypeUtil.schema >;
