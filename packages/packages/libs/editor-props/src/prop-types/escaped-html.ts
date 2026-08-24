import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const escapedHtmlPropTypeUtil = createPropUtils( 'escaped-html', z.string().nullable() );

export type EscapedHtmlPropValue = z.infer< typeof escapedHtmlPropTypeUtil.schema >;
