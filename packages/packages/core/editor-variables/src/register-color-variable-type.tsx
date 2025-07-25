import * as React from 'react';
import { styleTransformersRegistry } from '@elementor/editor-canvas';
import { registerControlReplacement, stylesInheritanceTransformersRegistry } from '@elementor/editor-editing-panel';
import { colorPropTypeUtil } from '@elementor/editor-props';
import { BrushIcon } from '@elementor/icons';

import { ColorField } from './components/fields/color-field';
import { ColorIndicator } from './components/ui/color-indicator';
import { ColorVariableControl } from './controls/color-variable-control';
import { colorVariablePropTypeUtil } from './prop-types/color-variable-prop-type';
import { registerRepeaterInjections } from './repeater-injections';
import { inheritanceTransformer } from './transformers/inheritance-transformer';
import { variableTransformer } from './transformers/variable-transformer';
import { hasAssignedColorVariable } from './utils';
import { registerVariableType } from './variables-registry/variable-type-registry';

export function registerColorVariableType() {
	registerVariableType( {
		valueField: ColorField,
		icon: BrushIcon,
		propTypeUtil: colorVariablePropTypeUtil,
		fallbackPropTypeUtil: colorPropTypeUtil,
		variableType: 'color',
		startIcon: ( { value } ) => <ColorIndicator size="inherit" component="span" value={ value } />,
	} );

	registerControlReplacement( {
		component: ColorVariableControl,
		condition: ( { value } ) => hasAssignedColorVariable( value ),
	} );

	styleTransformersRegistry.register( colorVariablePropTypeUtil.key, variableTransformer );
	stylesInheritanceTransformersRegistry.register( colorVariablePropTypeUtil.key, inheritanceTransformer );

	registerRepeaterInjections();
}
