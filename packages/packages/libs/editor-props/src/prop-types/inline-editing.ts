import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const inlineEditingPropTypeUtil = createPropUtils( 'inline-editing', z.string().nullable() );

export type InlineEditingPropValue = z.infer< typeof inlineEditingPropTypeUtil.schema >;
