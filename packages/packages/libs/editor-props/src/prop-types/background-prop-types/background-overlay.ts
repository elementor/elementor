import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { backgroundColorOverlayPropTypeUtil } from './background-color-overlay';
import { backgroundGradientOverlayPropTypeUtil } from './background-gradient-overlay';
import { backgroundImageOverlayPropTypeUtil } from './background-image-overlay';

const backgroundOverlayItem = backgroundColorOverlayPropTypeUtil.schema
	.or( backgroundGradientOverlayPropTypeUtil.schema )
	.or( backgroundImageOverlayPropTypeUtil.schema );

export const backgroundOverlayPropTypeUtil = createPropUtils( 'background-overlay', z.array( backgroundOverlayItem ) );

export type BackgroundOverlayPropValue = z.infer< typeof backgroundOverlayPropTypeUtil.schema >;
export type BackgroundOverlayItemPropValue = z.infer< typeof backgroundOverlayItem >;
