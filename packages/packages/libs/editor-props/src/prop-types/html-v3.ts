import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { type ChildElement } from './html-v2';
import { stringPropTypeUtil } from './string';

const childElementSchema: z.ZodType< ChildElement > = z.lazy( () =>
	z.object( {
		id: z.string(),
		type: z.string(),
		content: z.string().optional(),
		children: z.array( childElementSchema ).optional(),
	} )
);

const htmlV3ValueSchema = z.object( {
	content: stringPropTypeUtil.schema.nullable(),
	children: z.array( childElementSchema ),
} );

export const htmlV3PropTypeUtil = createPropUtils( 'html-v3', htmlV3ValueSchema );

export type HtmlV3PropValue = z.infer< typeof htmlV3PropTypeUtil.schema >;

export type HtmlV3Value = z.infer< typeof htmlV3ValueSchema >;
