import { type PropType, type PropValue } from '@elementor/editor-props';

import { colorVariablePropTypeUtil } from './prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from './prop-types/font-variable-prop-type';

export const hasAssignedColorVariable = ( propValue: PropValue ): boolean => {
	return !! colorVariablePropTypeUtil.isValid( propValue );
};

export const supportsColorVariables = ( propType: PropType ): boolean => {
	return propType.kind === 'union' && colorVariablePropTypeUtil.key in propType.prop_types;
};

export const hasAssignedFontVariable = ( propValue: PropValue ): boolean => {
	return !! fontVariablePropTypeUtil.isValid( propValue );
};

export const supportsFontVariables = ( propType: PropType ): boolean => {
	return propType.kind === 'union' && fontVariablePropTypeUtil.key in propType.prop_types;
};
