import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { stringPropTypeUtil } from './string';

const htmlV3ValueSchema = z.object( {
	content: stringPropTypeUtil.schema.nullable(),
	children: z.array( z.unknown() ).default( [] ),
} );

const baseHtmlV3PropTypeUtil = createPropUtils( 'html-v3', htmlV3ValueSchema );

export const htmlV3PropTypeUtil = {
	...baseHtmlV3PropTypeUtil,
	extract( prop: unknown ): HtmlV3Value | null {
		if ( ! baseHtmlV3PropTypeUtil.isValid( prop ) ) {
			return null;
		}

		const parsed = htmlV3ValueSchema.safeParse( ( prop as HtmlV3PropValue ).value );

		return parsed.success ? parsed.data : null;
	},
};

export type HtmlV3PropValue = z.infer< typeof htmlV3PropTypeUtil.schema >;

export type HtmlV3Value = z.infer< typeof htmlV3ValueSchema >;
