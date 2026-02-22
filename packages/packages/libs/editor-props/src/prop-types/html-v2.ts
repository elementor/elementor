import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export interface ChildElement {
	id: string;
	type: string;
	content?: string;
	children?: ChildElement[];
}

const childElementSchema: z.ZodType< ChildElement > = z.lazy( () =>
	z.object( {
		id: z.string(),
		type: z.string(),
		content: z.string().optional(),
		children: z.array( childElementSchema ).optional(),
	} )
);

const htmlV2ValueSchema = z.object( {
	content: z.string().nullable(),
	children: z.array( childElementSchema ),
} );

export const htmlV2PropTypeUtil = createPropUtils( 'html-v2', htmlV2ValueSchema );

export type HtmlV2PropValue = z.infer< typeof htmlV2PropTypeUtil.schema >;

export type HtmlV2Value = z.infer< typeof htmlV2ValueSchema >;
