import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const emailPropTypeUtil = createPropUtils(
	'email',
	z.strictObject( {
		to: z.string().email(),
		subject: unknownChildrenSchema,
		message: unknownChildrenSchema,
		from: unknownChildrenSchema,
		'meta-data': unknownChildrenSchema,
		'send-as': unknownChildrenSchema,
		'from-name': unknownChildrenSchema,
		'reply-to': z.string().email(),
		cc: z.string().email(),
		bcc: z.string().email(),
	} )
);

export type EmailPropValue = z.infer< typeof emailPropTypeUtil.schema >;
