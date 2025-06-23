import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { blurFilterPropTypeUtil } from './blur-filter';
import { brightnessFilterPropTypeUtil } from './brightness-filter';

const filterTypes = blurFilterPropTypeUtil.schema.or( brightnessFilterPropTypeUtil.schema );
export const filterPropTypeUtil = createPropUtils( 'filter', z.array( filterTypes ) );

export type FilterPropValue = z.infer< typeof filterPropTypeUtil.schema >;

export type FilterItemPropValue = z.infer< typeof filterTypes >;
