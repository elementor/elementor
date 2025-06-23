import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { colorPropTypeUtil } from '@elementor/editor-props';

import { ColorIndicator } from '../components/ui/color-indicator';
import { AssignedVariable } from '../components/ui/variable/assigned-variable';
import { DeletedVariable } from '../components/ui/variable/deleted-variable';
import { useVariable } from '../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';

export const ColorVariableControl = () => {
	const { value: variableValue } = useBoundProp( colorVariablePropTypeUtil );
	const assignedVariable = useVariable( variableValue );

	if ( ! assignedVariable ) {
		throw new Error( `Global color variable ${ variableValue } not found` );
	}

	const isVariableDeleted = assignedVariable?.deleted;

	if ( isVariableDeleted ) {
		return <DeletedVariable variable={ assignedVariable } />;
	}

	return (
		<AssignedVariable
			variable={ assignedVariable }
			variablePropTypeUtil={ colorVariablePropTypeUtil }
			fallbackPropTypeUtil={ colorPropTypeUtil }
			additionalStartIcon={ <ColorIndicator size="inherit" value={ assignedVariable.value } component="span" /> }
		/>
	);
};
