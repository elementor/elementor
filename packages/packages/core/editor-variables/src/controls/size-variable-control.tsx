import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { sizePropTypeUtil } from '@elementor/editor-props';

import { AssignedVariable } from '../components/ui/variable/assigned-variable';
import { DeletedVariable } from '../components/ui/variable/deleted-variable';
import { MissingVariable } from '../components/ui/variable/missing-variable';
import { useVariable } from '../hooks/use-prop-variables';
import { sizeVariablePropTypeUtil } from '../prop-types/size-variable-prop-type';

export const SizeVariableControl = () => {
	const { value: variableValue } = useBoundProp( sizeVariablePropTypeUtil );

	const assignedVariable = useVariable( variableValue );
	if ( ! assignedVariable ) {
		return <MissingVariable />;
	}

	if ( assignedVariable?.deleted ) {
		return (
			<DeletedVariable
				variable={ assignedVariable }
				variablePropTypeUtil={ sizeVariablePropTypeUtil }
				fallbackPropTypeUtil={ sizePropTypeUtil }
			/>
		);
	}

	return (
		<AssignedVariable
			variable={ assignedVariable }
			variablePropTypeUtil={ sizeVariablePropTypeUtil }
			fallbackPropTypeUtil={ sizePropTypeUtil }
		/>
	);
};
