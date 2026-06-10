import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { formatFontFamilyForCss, getEnqueueFontFamily } from '../utils/font-family-value';

const baseUtil = createPropUtils( 'font-family', z.string().nullable() );

export const fontFamilyPropTypeUtil = Object.assign( baseUtil, {
	formatForCss: formatFontFamilyForCss,
	getEnqueueFontFamily,
} );

export type FontFamilyPropValue = z.infer< typeof fontFamilyPropTypeUtil.schema >;
