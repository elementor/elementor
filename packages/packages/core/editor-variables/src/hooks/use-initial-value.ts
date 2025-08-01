import { useBoundProp } from '@elementor/editor-controls';
import { type createPropUtils } from '@elementor/editor-props';

import { useVariable } from './use-prop-variables';

type PropTypeUtil = ReturnType< typeof createPropUtils >;

type PropValue = {
	$$type: string;
	value: string;
};

export const useInitialValue = ( propTypeUtil: PropTypeUtil ) => {
	const { value: initial }: { value: PropValue } = useBoundProp();

	const hasAssignedVariable = initial?.$$type === propTypeUtil.key && initial?.value;
	const variable = useVariable( hasAssignedVariable ? initial.value : '' );

	if ( hasAssignedVariable ) {
		return variable ? variable.value : '';
	}

	return initial?.value ?? '';
};
