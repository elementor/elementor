import { styleTransformersRegistry } from '@elementor/editor-canvas';
import { injectIntoRepeaterItemIcon, injectIntoRepeaterItemLabel } from '@elementor/editor-controls';
import { controlActionsMenu, registerControlReplacement } from '@elementor/editor-editing-panel';
import { backgroundColorOverlayPropTypeUtil, type PropValue, shadowPropTypeUtil } from '@elementor/editor-props';

import {
	BackgroundRepeaterColorIndicator,
	BackgroundRepeaterLabel,
	BoxShadowRepeaterColorIndicator,
} from './components/variables-repeater-item-slot';
import { ColorVariableControl } from './controls/color-variable-control';
import { usePropColorVariableAction } from './hooks/use-prop-color-variable-action';
import { colorVariablePropTypeUtil } from './prop-types/color-variable-prop-type';
import { variableTransformer } from './transformers/variable-transformer';
import { hasAssignedColorVariable } from './utils';

const { registerPopoverAction } = controlActionsMenu;

const conditions = {
	backgroundOverlay: ( { value: prop }: { value: PropValue } ) => {
		return hasAssignedColorVariable( backgroundColorOverlayPropTypeUtil.extract( prop )?.color );
	},

	boxShadow: ( { value: prop }: { value: PropValue } ) => {
		return hasAssignedColorVariable( shadowPropTypeUtil.extract( prop )?.color );
	},
};

function registerControlsAndActions() {
	registerControlReplacement( {
		component: ColorVariableControl,
		condition: ( { value } ) => hasAssignedColorVariable( value ),
	} );

	registerPopoverAction( {
		id: 'color-variables',
		useProps: usePropColorVariableAction,
	} );
}

function registerRepeaterItemIcons() {
	injectIntoRepeaterItemIcon( {
		id: 'color-variables-background-icon',
		component: BackgroundRepeaterColorIndicator,
		condition: conditions.backgroundOverlay,
	} );

	injectIntoRepeaterItemIcon( {
		id: 'color-variables-icon',
		component: BoxShadowRepeaterColorIndicator,
		condition: conditions.boxShadow,
	} );
}

function registerRepeaterItemLabels() {
	injectIntoRepeaterItemLabel( {
		id: 'color-variables-label',
		component: BackgroundRepeaterLabel,
		condition: conditions.backgroundOverlay,
	} );
}

function registerStyleTransformers() {
	styleTransformersRegistry.register( colorVariablePropTypeUtil.key, variableTransformer );
}

export function initColorVariables() {
	registerControlsAndActions();
	registerRepeaterItemIcons();
	registerRepeaterItemLabels();
	registerStyleTransformers();
}
