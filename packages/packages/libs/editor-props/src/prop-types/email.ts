import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const emailPropTypeUtil = createPropUtils(
	'email',
	z.strictObject( {
		to: unknownChildrenSchema,
		subject: unknownChildrenSchema,
		message: unknownChildrenSchema,
		from: unknownChildrenSchema,
		'meta-data': unknownChildrenSchema,
		'send-as': unknownChildrenSchema,
		'from-name': unknownChildrenSchema,
		'reply-to': unknownChildrenSchema,
		cc: unknownChildrenSchema,
		bcc: unknownChildrenSchema,
	} )
);

export type EmailPropValue = z.infer< typeof emailPropTypeUtil.schema >;
