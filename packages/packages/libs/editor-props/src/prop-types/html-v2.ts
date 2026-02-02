import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export type HtmlV2Child = {
	id: string;
	type: string;
	content?: string;
	children?: HtmlV2Child[];
};

const htmlV2ChildSchema: z.ZodType< HtmlV2Child > = z.lazy( () =>
	z.object( {
		id: z.string(),
		type: z.string(),
		content: z.string().optional(),
		children: z.array( htmlV2ChildSchema ).optional(),
	} )
);

const htmlV2ValueSchema = z.union( [
	z.string().nullable(),
	z.object( {
		content: z.string().nullable(),
		children: z.array( htmlV2ChildSchema ).optional(),
	} ),
] );

export const htmlV2PropTypeUtil = createPropUtils( 'html-v2', htmlV2ValueSchema );

export type HtmlV2PropValue = z.infer< typeof htmlV2PropTypeUtil.schema >;
