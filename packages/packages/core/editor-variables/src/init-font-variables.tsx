import * as React from 'react';
import { styleTransformersRegistry } from '@elementor/editor-canvas';
import {
	controlActionsMenu,
	registerControlReplacement,
	stylesInheritanceTransformersRegistry,
} from '@elementor/editor-editing-panel';
import { TextIcon } from '@elementor/icons';

import { FontField } from './components/fields/font-field';
import { FontVariableControl } from './controls/font-variable-control';
import { usePropFontVariableAction } from './hooks/use-prop-font-variable-action';
import { fontVariablePropTypeUtil } from './prop-types/font-variable-prop-type';
import { inheritanceTransformer } from './transformers/inheritance-transformer';
import { variableTransformer } from './transformers/variable-transformer';
import { hasAssignedFontVariable } from './utils';
import { registerVariable } from './variable-registry';

const { registerPopoverAction } = controlActionsMenu;

export function initFontVariables() {
	registerControlReplacement( {
		component: FontVariableControl,
		condition: ( { value } ) => hasAssignedFontVariable( value ),
	} );

	registerPopoverAction( {
		id: 'font-variables',
		useProps: usePropFontVariableAction,
	} );

	registerVariable( {
		valueField: FontField,
		icon: TextIcon,
		propType: fontVariablePropTypeUtil,
		variableType: 'font',
		listIcon: () => <TextIcon fontSize="tiny" />,
	} );

	styleTransformersRegistry.register( fontVariablePropTypeUtil.key, variableTransformer );
	stylesInheritanceTransformersRegistry.register( fontVariablePropTypeUtil.key, inheritanceTransformer );
}
