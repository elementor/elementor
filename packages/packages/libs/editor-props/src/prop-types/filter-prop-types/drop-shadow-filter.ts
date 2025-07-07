import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const dropShadowFilterPropTypeUtil = createPropUtils( 'drop-shadow', unknownChildrenSchema );

export type DropShadowFilterPropValue = z.infer< typeof dropShadowFilterPropTypeUtil.schema >;
