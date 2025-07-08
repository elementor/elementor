import { styleTransformersRegistry } from '@elementor/editor-canvas';
import {
	controlActionsMenu,
	registerControlReplacement,
	stylesInheritanceTransformersRegistry,
} from '@elementor/editor-editing-panel';

import { ColorVariableControl } from './controls/color-variable-control';
import { usePropColorVariableAction } from './hooks/use-prop-color-variable-action';
import { colorVariablePropTypeUtil } from './prop-types/color-variable-prop-type';
import { registerRepeaterInjections } from './repeater-injections';
import { inheritanceTransformer } from './transformers/inheritance-transformer';
import { variableTransformer } from './transformers/variable-transformer';
import { hasAssignedColorVariable } from './utils';

const { registerPopoverAction } = controlActionsMenu;

export function initColorVariables() {
	registerControlReplacement( {
		component: ColorVariableControl,
		condition: ( { value } ) => hasAssignedColorVariable( value ),
	} );

	registerPopoverAction( {
		id: 'color-variables',
		useProps: usePropColorVariableAction,
	} );

	styleTransformersRegistry.register( colorVariablePropTypeUtil.key, variableTransformer );
	stylesInheritanceTransformersRegistry.register( colorVariablePropTypeUtil.key, inheritanceTransformer );

	registerRepeaterInjections();
}
