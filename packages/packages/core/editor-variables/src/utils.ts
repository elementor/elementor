import { type PropValue, type TransformablePropValue } from '@elementor/editor-props';

import { colorVariablePropTypeUtil } from './prop-types/color-variable-prop-type';
import { getVariable } from './variable-registry';

export const hasAssignedColorVariable = ( propValue: PropValue ): boolean => {
	return !! colorVariablePropTypeUtil.isValid( propValue );
};

export function hasAssignedVariable( propValue: TransformablePropValue< string, string > ) {
	return !! getVariable( propValue.$$type );
}
