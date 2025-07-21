import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { cssFilterFunctionPropUtil } from './filter';

export const backdropFilterPropTypeUtil = createPropUtils(
	'backdrop-filter',
	z.array( cssFilterFunctionPropUtil.schema )
);

export type BackdropFilterPropValue = z.infer< typeof backdropFilterPropTypeUtil.schema >;

export type BackdropFilterItemPropValue = z.infer< typeof cssFilterFunctionPropUtil.schema >;
