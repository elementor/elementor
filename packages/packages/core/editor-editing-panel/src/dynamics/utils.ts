import {
	createPropUtils,
	isTransformable,
	type PropType,
	type PropValue,
	type TransformablePropType,
} from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { type DynamicPropType } from './types';

const DYNAMIC_PROP_TYPE_KEY = 'dynamic';

const isDynamicPropType = ( prop: TransformablePropType ): prop is DynamicPropType =>
	prop.key === DYNAMIC_PROP_TYPE_KEY;

export const getDynamicPropType = ( propType: PropType ): DynamicPropType | null => {
	const dynamicPropType = propType.kind === 'union' && propType.prop_types[ DYNAMIC_PROP_TYPE_KEY ];

	return dynamicPropType && isDynamicPropType( dynamicPropType ) ? dynamicPropType : null;
};

export const isDynamicPropValue = ( prop: PropValue ): prop is DynamicPropValue => {
	return isTransformable( prop ) && prop.$$type === DYNAMIC_PROP_TYPE_KEY;
};

export const supportsDynamic = ( propType: PropType ): boolean => {
	return !! getDynamicPropType( propType );
};

export const dynamicPropTypeUtil = createPropUtils(
	DYNAMIC_PROP_TYPE_KEY,
	z.strictObject( {
		name: z.string(),
		settings: z.any().optional(),
	} )
);

export type DynamicPropValue = z.infer< typeof dynamicPropTypeUtil.schema >;
