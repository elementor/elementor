import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const emailAdvancedPropTypeUtil = createPropUtils(
	'email-advanced',
	z.strictObject( {
		'from-name': unknownChildrenSchema,
		'reply-to': unknownChildrenSchema,
		cc: unknownChildrenSchema,
		bcc: unknownChildrenSchema,
	} )
);

export type EmailAdvancedPropValue = z.infer< typeof emailAdvancedPropTypeUtil.schema >;
