import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { stringPropTypeUtil } from './string';

const htmlV3ValueSchema = z.object( {
	content: stringPropTypeUtil.schema.nullable(),
	children: z.array( z.unknown() ),
} );

export const htmlV3PropTypeUtil = createPropUtils( 'html-v3', htmlV3ValueSchema );

export type HtmlV3PropValue = z.infer< typeof htmlV3PropTypeUtil.schema >;

export type HtmlV3Value = z.infer< typeof htmlV3ValueSchema >;
