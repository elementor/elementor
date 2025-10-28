import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { stringPropTypeUtil } from './string';

export const displayConditionsPropTypeUtil = createPropUtils(
	'display-conditions',
	z.array( stringPropTypeUtil.schema )
);

export type DisplayConditionsPropValue = z.infer< typeof displayConditionsPropTypeUtil.schema >;
