import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { filterTypes } from './filter';

export const backdropFilterPropTypeUtil = createPropUtils( 'backdrop-filter', z.array( filterTypes ) );

export type BackdropFilterPropValue = z.infer< typeof backdropFilterPropTypeUtil.schema >;

export type BackdropFilterItemPropValue = z.infer< typeof filterTypes >;
