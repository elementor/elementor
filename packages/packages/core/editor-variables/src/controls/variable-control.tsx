import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type TransformablePropValue } from '@elementor/editor-props';

import { AssignedVariable } from '../components/ui/variable/assigned-variable';
import { DeletedVariable } from '../components/ui/variable/deleted-variable';
import { MissingVariable } from '../components/ui/variable/missing-variable';
import { useVariable } from '../hooks/use-prop-variables';

export const VariableControl = () => {
	const boundProp = useBoundProp().value as TransformablePropValue< string, string >;

	const assignedVariable = useVariable( boundProp?.value );

	if ( ! assignedVariable ) {
		return <MissingVariable />;
	}

	const { $$type: propTypeKey } = boundProp;

	if ( assignedVariable?.deleted ) {
		return <DeletedVariable variable={ assignedVariable } propTypeKey={ propTypeKey } />;
	}

	return <AssignedVariable variable={ assignedVariable } propTypeKey={ propTypeKey } />;
};
