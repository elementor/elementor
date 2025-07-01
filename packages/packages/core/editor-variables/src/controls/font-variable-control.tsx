import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { stringPropTypeUtil } from '@elementor/editor-props';

import { AssignedVariable } from '../components/ui/variable/assigned-variable';
import { DeletedVariable } from '../components/ui/variable/deleted-variable';
import { useVariable } from '../hooks/use-prop-variables';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';

export const FontVariableControl = () => {
	const { value: variableValue } = useBoundProp( fontVariablePropTypeUtil );
	const assignedVariable = useVariable( variableValue );

	if ( ! assignedVariable ) {
		throw new Error( `Global font variable ${ variableValue } not found` );
	}

	const isVariableDeleted = assignedVariable?.deleted;

	if ( isVariableDeleted ) {
		return (
			<DeletedVariable
				variable={ assignedVariable }
				variablePropTypeUtil={ fontVariablePropTypeUtil }
				fallbackPropTypeUtil={ stringPropTypeUtil }
			/>
		);
	}

	return (
		<AssignedVariable
			variable={ assignedVariable }
			variablePropTypeUtil={ fontVariablePropTypeUtil }
			fallbackPropTypeUtil={ stringPropTypeUtil }
		/>
	);
};
