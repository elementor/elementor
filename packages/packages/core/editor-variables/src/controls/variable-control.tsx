import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type TransformablePropValue } from '@elementor/editor-props';

import { AssignedVariable } from '../components/ui/variable/assigned-variable';
import { DeletedVariable } from '../components/ui/variable/deleted-variable';
import { MissingVariable } from '../components/ui/variable/missing-variable';
import { useVariable } from '../hooks/use-prop-variables';
import { getVariable } from '../variable-registry';

export const VariableControl = () => {
	const value = useBoundProp().value as TransformablePropValue< string, string >;
	const { propTypeUtil, startIcon } = getVariable( value.$$type );

	console.log( useBoundProp() );
	const assignedVariable = useVariable( value.value );

	if ( ! assignedVariable ) {
		return <MissingVariable />;
	}

	if ( assignedVariable?.deleted ) {
		return <DeletedVariable variable={ assignedVariable } variablePropTypeUtil={ propTypeUtil } />;
	}

	const StartIcon = startIcon || ( () => null );

	return (
		<AssignedVariable
			variable={ assignedVariable }
			variablePropTypeUtil={ propTypeUtil }
			additionalStartIcon={ <StartIcon value={ assignedVariable.value } /> }
		/>
	);
};
