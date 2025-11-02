import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { unknownChildrenSchema } from './utils';

export const richTextPropTypeUtil = createPropUtils(
	'rich-text',
	z.strictObject( {
		tag: unknownChildrenSchema,
		content: unknownChildrenSchema,
	} )
);

export type RichTextPropValue = z.infer< typeof richTextPropTypeUtil.schema >;
