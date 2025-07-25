import { type PropValue } from '@elementor/editor-props';

import { colorVariablePropTypeUtil } from './prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from './prop-types/font-variable-prop-type';
import { hasVariableType } from './variables-registry/variable-type-registry';

export const hasAssignedColorVariable = ( propValue: PropValue ): boolean => {
	return !! colorVariablePropTypeUtil.isValid( propValue );
};

export const hasAssignedFontVariable = ( propValue: PropValue ): boolean => {
	return !! fontVariablePropTypeUtil.isValid( propValue );
};

export function hasAssignedVariable( propValue: PropValue ) {
	if ( propValue && typeof propValue === 'object' && '$$type' in propValue ) {
		return hasVariableType( propValue.$$type );
	}

	return false;
}
