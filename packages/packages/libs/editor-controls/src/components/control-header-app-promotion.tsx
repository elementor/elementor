import * as React from 'react';

import { AppPromotionTrigger } from '../controls/app-promotion-trigger';
import { type ControlHeaderProps } from './control-header-location';

export const ControlHeaderAppPromotion = ( { promotion }: ControlHeaderProps ) => (
	<AppPromotionTrigger promotion={ promotion } />
);
