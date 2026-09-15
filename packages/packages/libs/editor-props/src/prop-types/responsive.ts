import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { RESPONSIVE_BREAKPOINT_KEYS } from '../utils/resolve-responsive-value';
import { unknownChildrenSchema } from './utils';

const responsiveShape = Object.fromEntries(
	RESPONSIVE_BREAKPOINT_KEYS.map( ( key ) => [ key, unknownChildrenSchema.optional() ] )
);

export const responsivePropTypeUtil = createPropUtils( 'responsive', z.object( responsiveShape ).partial() );

export type ResponsivePropValue = z.infer< typeof responsivePropTypeUtil.schema >;
