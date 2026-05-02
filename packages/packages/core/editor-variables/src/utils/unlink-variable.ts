import { type PropValue } from '@elementor/editor-props';

import { type Variable } from '../types';
import { getVariableType } from '../variables-registry/variable-type-registry';

export function transformValueBeforeUnlink( variable: Variable, propTypeKey: string ): string | PropValue {
	const { valueTransformer } = getVariableType( propTypeKey );

	if ( valueTransformer ) {
		return valueTransformer( variable.value, variable.type );
	}

	return variable.value;
}

export function createUnlinkHandler(
	variable: Variable,
	propTypeKey: string,
	setValue: ( value: PropValue ) => void
): () => void {
	return () => {
		const { fallbackPropTypeUtil } = getVariableType( propTypeKey );
		const transformedValue = transformValueBeforeUnlink( variable, propTypeKey );

		setValue( fallbackPropTypeUtil.create( transformedValue ) );
	};
}
