import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const wysiwygPropTypeUtil = createPropUtils( 'wysiwyg_prop', z.string().nullable() );

export type WysiwygPropValue = z.infer< typeof wysiwygPropTypeUtil.schema >;
