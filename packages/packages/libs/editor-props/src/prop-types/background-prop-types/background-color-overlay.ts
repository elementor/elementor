import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const backgroundColorOverlayPropTypeUtil = createPropUtils( 'background-color-overlay', unknownChildrenSchema );

export type BackgroundColorOverlayPropValue = z.infer< typeof backgroundColorOverlayPropTypeUtil.schema >;
