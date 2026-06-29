import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const spanPropTypeUtil = createPropUtils( 'span', z.string().nullable() );

export type SpanPropValue = z.infer< typeof spanPropTypeUtil.schema >;
