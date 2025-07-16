import { styleTransformersRegistry } from '@elementor/editor-canvas';
import {
	controlActionsMenu,
	registerControlReplacement,
	stylesInheritanceTransformersRegistry,
} from '@elementor/editor-editing-panel';

import { SizeVariableControl } from './controls/size-variable-control';
import { usePropSizeVariableAction } from './hooks/use-prop-size-variable-action';
import { sizeVariablePropTypeUtil } from './prop-types/size-variable-prop-type';
import { inheritanceTransformer } from './transformers/inheritance-transformer';
import { variableTransformer } from './transformers/variable-transformer';
import { hasAssignedSizeVariable } from './utils';

const { registerPopoverAction } = controlActionsMenu;

export function initSizeVariables() {
	registerControlReplacement( {
		component: SizeVariableControl,
		condition: ( { value } ) => hasAssignedSizeVariable( value ),
	} );

	registerPopoverAction( {
		id: 'size-variables',
		useProps: usePropSizeVariableAction,
	} );

	styleTransformersRegistry.register( sizeVariablePropTypeUtil.key, variableTransformer );
	stylesInheritanceTransformersRegistry.register( sizeVariablePropTypeUtil.key, inheritanceTransformer );
}
