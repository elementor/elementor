import { type PropValue, sizePropTypeUtil } from '@elementor/editor-props';

import { getVariable } from '../hooks/use-prop-variables';
import { customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../prop-types';

const DEFAULT_UNIT = 'px';
const CUSTOM_SIZE_LABEL = 'fx';

export function sizeValue( value: PropValue ) {
	if ( sizeVariablePropTypeUtil.isValid( value ) || customSizeVariablePropTypeUtil.isValid( value ) ) {
		const variable = getVariable( value?.value );
		return variable?.value;
	}

	if ( sizePropTypeUtil.isValid( value ) ) {
		const { size, unit } = value.value;

		if ( 'custom' !== unit ) {
			return `${ size ?? 0 }${ unit ?? DEFAULT_UNIT }`;
		}

		if ( ! size ) {
			return CUSTOM_SIZE_LABEL;
		}

		return size;
	}

	return '';
}
