import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const linkPropTypeUtil = createPropUtils(
	'link',
	z.strictObject( {
		destination: unknownChildrenSchema,
		label: unknownChildrenSchema,
		isTargetBlank: unknownChildrenSchema,
	} )
);

export type LinkPropValue = z.infer< typeof linkPropTypeUtil.schema >;
