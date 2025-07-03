import { settingsTransformersRegistry, styleTransformersRegistry } from '@elementor/editor-canvas';
import { injectIntoRepeaterItemIcon, injectIntoRepeaterItemLabel } from '@elementor/editor-controls';
import { type BackgroundOverlayPropType, type PropValue } from '@elementor/editor-props';
import { type InjectedComponent } from '@elementor/locations';

import { registerControlReplacement } from '../control-replacement';
import { controlActionsMenu } from '../controls-actions';
import {
	BackgroundControlDynamicTagIcon,
	BackgroundControlDynamicTagLabel,
} from './components/background-control-dynamic-tag';
import { DynamicSelectionControl } from './components/dynamic-selection-control';
import { dynamicTransformer } from './dynamic-transformer';
import { usePropDynamicAction } from './hooks/use-prop-dynamic-action';
import { isDynamicPropValue } from './utils';

const { registerPopoverAction } = controlActionsMenu;

export const init = () => {
	registerControlReplacement( {
		component: DynamicSelectionControl,
		condition: ( { value } ) => isDynamicPropValue( value ),
	} );

	injectIntoRepeaterItemLabel( {
		id: 'dynamic-background-image',
		condition: ( { value } ) =>
			isDynamicPropValue( ( value as BackgroundOverlayPropType ).value?.image?.value?.src ),
		component: BackgroundControlDynamicTagLabel as InjectedComponent< { value: PropValue } >,
	} );

	injectIntoRepeaterItemIcon( {
		id: 'dynamic-background-image',
		condition: ( { value } ) =>
			isDynamicPropValue( ( value as BackgroundOverlayPropType ).value?.image?.value?.src ),
		component: BackgroundControlDynamicTagIcon,
	} );

	registerPopoverAction( {
		id: 'dynamic-tags',
		useProps: usePropDynamicAction,
	} );

	styleTransformersRegistry.register( 'dynamic', dynamicTransformer );
	settingsTransformersRegistry.register( 'dynamic', dynamicTransformer );
};
