import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { moveTransformPropTypeUtil } from './move-transform';
import { rotateTransformPropTypeUtil } from './rotate-transform';
import { scaleTransformPropTypeUtil } from './scale-transform';

const filterTypes = z.union( [
	moveTransformPropTypeUtil.schema,
	scaleTransformPropTypeUtil.schema,
	rotateTransformPropTypeUtil.schema,
] );
export const transformPropTypeUtil = createPropUtils( 'transform', z.array( filterTypes ) );

export type TransformPropValue = z.infer< typeof transformPropTypeUtil.schema >;

export type TransformItemPropValue = z.infer< typeof filterTypes >;
