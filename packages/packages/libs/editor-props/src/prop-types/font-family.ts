import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const fontFamilyPropTypeUtil = createPropUtils( 'font-family', z.string().nullable() );

export type FontFamilyPropValue = z.infer< typeof fontFamilyPropTypeUtil.schema >;
