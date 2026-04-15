import { injectIntoRepeaterItemIcon, injectIntoRepeaterItemLabel } from '@elementor/editor-controls';
import {
	backgroundColorOverlayPropTypeUtil,
	cssFilterFunctionPropUtil,
	dropShadowFilterPropTypeUtil,
	type PropValue,
	selectionSizePropTypeUtil,
	shadowPropTypeUtil,
} from '@elementor/editor-props';

import {
	BackgroundRepeaterColorIndicator,
	BackgroundRepeaterLabel,
	BoxShadowRepeaterColorIndicator,
	DropShadowFilterIconIndicator,
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
	filterRepeaterInjections();
}

function backgroundOverlayRepeaterInjections() {
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
}

function boxShadowRepeaterInjections() {
	injectIntoRepeaterItemIcon( {
		id: 'color-variables-box-shadow-icon',
		component: BoxShadowRepeaterColorIndicator,
		condition: ( { value }: Args ) => {
			return hasAssignedColorVariable( shadowPropTypeUtil.extract( value )?.color );
		},
	} );
}

function transitionsRepeaterInjections() {
	injectIntoRepeaterItemLabel( {
		id: 'transition-size-variables-label',
		component: TransitionsSizeVariableLabel,
		condition: ( { value }: Args ) => {
			return hasAssignedSizeVariable( selectionSizePropTypeUtil.extract( value )?.size );
		},
	} );
}

function filterRepeaterInjections() {
	injectIntoRepeaterItemIcon( {
		id: 'color-variables-filter-icon',
		component: DropShadowFilterIconIndicator,
		condition: ( { value }: Args ) => {
			const cssFilterFunc = cssFilterFunctionPropUtil.extract( value );
			if ( dropShadowFilterPropTypeUtil.isValid( cssFilterFunc?.args ) ) {
				const color = dropShadowFilterPropTypeUtil.extract( cssFilterFunc.args )?.color;
				return hasAssignedColorVariable( color );
			}
			return false;
		},
	} );
}

function hasAssignedSizeVariable( value: PropValue ): boolean {
	if ( sizeVariablePropTypeUtil.isValid( value ) ) {
		return true;
	}

	if ( customSizeVariablePropTypeUtil.isValid( value ) ) {
		return true;
	}

	return false;
}

function hasAssignedColorVariable( value: PropValue ): boolean {
	return !! colorVariablePropTypeUtil.isValid( value );
}
