import { type z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { unknownChildrenSchema } from '../utils';

export const grayscaleFilterPropTypeUtil = createPropUtils( 'grayscale', unknownChildrenSchema );

export type GrayscaleFilterPropValue = z.infer< typeof grayscaleFilterPropTypeUtil.schema >;
