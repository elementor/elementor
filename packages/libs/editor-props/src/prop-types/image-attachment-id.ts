import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const imageAttachmentIdPropType = createPropUtils( 'image-attachment-id', z.number() );

export type ImageAttachmentIdPropValue = z.infer< typeof imageAttachmentIdPropType.schema >;
