import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const colorPropTypeUtil = createPropUtils( 'color', z.string() );

export type ColorPropValue = z.infer< typeof colorPropTypeUtil.schema >;
