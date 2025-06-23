import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const urlPropTypeUtil = createPropUtils( 'url', z.string().nullable() );

export type UrlPropValue = z.infer< typeof urlPropTypeUtil.schema >;
