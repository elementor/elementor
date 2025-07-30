import { injectIntoRepeaterItemIcon, injectIntoRepeaterItemLabel } from '@elementor/editor-controls';
import { backgroundColorOverlayPropTypeUtil, type PropValue, shadowPropTypeUtil } from '@elementor/editor-props';

import {
	BackgroundRepeaterColorIndicator,
	BackgroundRepeaterLabel,
	BoxShadowRepeaterColorIndicator,
} from './components/variables-repeater-item-slot';
import { colorVariablePropTypeUtil } from './prop-types/color-variable-prop-type';

export function registerRepeaterInjections() {
	injectIntoRepeaterItemIcon( {
		id: 'color-variables-background-icon',
		component: BackgroundRepeaterColorIndicator,
		condition: ( { value: prop }: { value: PropValue } ) => {
			return hasAssignedColorVariable( backgroundColorOverlayPropTypeUtil.extract( prop )?.color );
		},
	} );

	injectIntoRepeaterItemIcon( {
		id: 'color-variables-icon',
		component: BoxShadowRepeaterColorIndicator,
		condition: ( { value: prop }: { value: PropValue } ) => {
			return hasAssignedColorVariable( shadowPropTypeUtil.extract( prop )?.color );
		},
	} );

	injectIntoRepeaterItemLabel( {
		id: 'color-variables-label',
		component: BackgroundRepeaterLabel,
		condition: ( { value: prop }: { value: PropValue } ) => {
			return hasAssignedColorVariable( backgroundColorOverlayPropTypeUtil.extract( prop )?.color );
		},
	} );
}

const hasAssignedColorVariable = ( propValue: PropValue ): boolean => {
	return !! colorVariablePropTypeUtil.isValid( propValue );
};
