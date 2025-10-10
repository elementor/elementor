import { useBoundProp } from '@elementor/editor-controls';

import { hasVariableType } from '../variables-registry/variable-type-registry';
import { useVariable } from './use-prop-variables';

type PropValue = {
	$$type: string;
	value: string;
};

export const useInitialValue = () => {
	const { value: initial }: { value: PropValue } = useBoundProp();

	const hasAssignedVariable = hasVariableType( initial?.$$type ) && Boolean( initial?.value );
	const variable = useVariable( hasAssignedVariable ? initial.value : '' );

	if ( hasAssignedVariable ) {
		return variable ? variable.value : '';
	}

	return initial?.value ?? '';
};
