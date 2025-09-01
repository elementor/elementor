import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type TransformablePropValue } from '@elementor/editor-props';

import { AssignedVariable } from '../components/ui/variable/assigned-variable';
import { DeletedVariable } from '../components/ui/variable/deleted-variable';
import { MismatchVariable } from '../components/ui/variable/mismatch-variable';
import { MissingVariable } from '../components/ui/variable/missing-variable';
import { useVariable } from '../hooks/use-prop-variables';
import { getVariableType } from '../variables-registry/variable-type-registry';

export const VariableControl = () => {
	const boundProp = useBoundProp();

	const boundPropValue = boundProp.value as TransformablePropValue< string, string >;

	const assignedVariable = useVariable( boundPropValue?.value );

	if ( ! assignedVariable ) {
		return <MissingVariable />;
	}

	const { $$type: propTypeKey } = boundPropValue;

	if ( assignedVariable?.deleted ) {
		return <DeletedVariable variable={ assignedVariable } propTypeKey={ propTypeKey } />;
	}

	const { isCompatible } = getVariableType( assignedVariable.type );

	if ( isCompatible && ! isCompatible( boundProp?.propType, assignedVariable ) ) {
		return <MismatchVariable variable={ assignedVariable } />;
	}

	return <AssignedVariable variable={ assignedVariable } propTypeKey={ propTypeKey } />;
};
