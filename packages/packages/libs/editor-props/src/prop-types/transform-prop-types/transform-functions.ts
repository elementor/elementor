import { z } from '@elementor/schema';

import { createPropUtils } from '../../utils/create-prop-utils';
import { moveTransformPropTypeUtil } from './transform-functions/move-transform';
import { rotateTransformPropTypeUtil } from './transform-functions/rotate-transform';
import { scaleTransformPropTypeUtil } from './transform-functions/scale-transform';
import { skewTransformPropTypeUtil } from './transform-functions/skew-transform';

const filterTypes = moveTransformPropTypeUtil.schema
	.or( scaleTransformPropTypeUtil.schema )
	.or( rotateTransformPropTypeUtil.schema )
	.or( skewTransformPropTypeUtil.schema );

export const transformFunctionsPropTypeUtil = createPropUtils( 'transform-functions', z.array( filterTypes ) );

export type TransformFunctionsPropValue = z.infer< typeof transformFunctionsPropTypeUtil.schema >;

export type TransformFunctionsItemPropValue = z.infer< typeof filterTypes >;
