import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const backgroundImageOverlayPropTypeUtil = createPropUtils( 'background-image-overlay', unknownChildrenSchema );

export type BackgroundImageOverlayPropValue = z.infer< typeof backgroundImageOverlayPropTypeUtil.schema >;
