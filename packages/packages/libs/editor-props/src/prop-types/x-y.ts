import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';
import { sizePropTypeUtil } from './size';

const positionSchema = z.strictObject( {
	x: sizePropTypeUtil.schema.nullable(),
	y: sizePropTypeUtil.schema.nullable(),
} );

export const positionPropTypeUtil = createPropUtils( 'object-position', positionSchema );

export const childrenPerspectivePropTypeUtil = createPropUtils( 'children-perspective', positionSchema );

export type PositionPropTypeValue = z.infer< typeof positionSchema >;
export type ChildrenPerspectivePropTypeValue = z.infer< typeof positionSchema >;
