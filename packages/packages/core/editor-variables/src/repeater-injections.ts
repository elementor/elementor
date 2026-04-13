import { injectIntoRepeaterItemIcon, injectIntoRepeaterItemLabel } from '@elementor/editor-controls';
import {
	backgroundColorOverlayPropTypeUtil,
	type PropValue,
	selectionSizePropTypeUtil,
	shadowPropTypeUtil,
} from '@elementor/editor-props';

import {
	BackgroundRepeaterColorIndicator,
	BackgroundRepeaterLabel,
	BoxShadowRepeaterColorIndicator,
	TransitionsSizeVariableLabel,
} from './components/variables-repeater-item-slot';
import { colorVariablePropTypeUtil, customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from './prop-types';

type Args = {
	value: PropValue;
};

export function registerRepeaterInjections() {
	backgroundOverlayRepeaterInjections();
	boxShadowRepeaterInjections();
	transitionsRepeaterInjections();
}

const backgroundOverlayRepeaterInjections = () => {
	injectIntoRepeaterItemIcon( {
		id: 'color-variables-background-icon',
		component: BackgroundRepeaterColorIndicator,
		condition: ( { value }: Args ) => {
			return hasAssignedColorVariable( backgroundColorOverlayPropTypeUtil.extract( value )?.color );
		},
	} );

	injectIntoRepeaterItemLabel( {
		id: 'color-variables-label',
		component: BackgroundRepeaterLabel,
		condition: ( { value }: Args ) => {
			return hasAssignedColorVariable( backgroundColorOverlayPropTypeUtil.extract( value )?.color );
		},
	} );
};

const boxShadowRepeaterInjections = () => {
	injectIntoRepeaterItemIcon( {
		id: 'color-variables-box-shadow-icon',
		component: BoxShadowRepeaterColorIndicator,
		condition: ( { value }: Args ) => {
			return hasAssignedColorVariable( shadowPropTypeUtil.extract( value )?.color );
		},
	} );
};

const transitionsRepeaterInjections = () => {
	injectIntoRepeaterItemLabel( {
		id: 'transition-size-variables-label',
		component: TransitionsSizeVariableLabel,
		condition: ( { value }: Args ) => {
			return hasAssignedSizeVariable( selectionSizePropTypeUtil.extract( value )?.size );
		},
	} );
};

const hasAssignedColorVariable = ( value: PropValue ): boolean => {
	return !! colorVariablePropTypeUtil.isValid( value );
};

const hasAssignedSizeVariable = ( value: PropValue ): boolean => {
	if ( sizeVariablePropTypeUtil.isValid( value ) ) {
		return true;
	}

	if ( customSizeVariablePropTypeUtil.isValid( value ) ) {
		return true;
	}

	return false;
};
