import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const videoAttachmentIdPropType = createPropUtils( 'video-attachment-id', z.number() );

export type VideoAttachmentIdPropValue = z.infer< typeof videoAttachmentIdPropType.schema >;
