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
	FilterDropShadowIconIndicator,
	FilterDropShadowRepeaterLabel,
	FilterSingleSizeRepeaterLabel,
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
		id: 'background-color-variables-icon',
		component: BackgroundRepeaterColorIndicator,
		condition: ( { value }: Args ) => {
			return hasAssignedColorVariable( backgroundColorOverlayPropTypeUtil.extract( value )?.color );
		},
	} );

	injectIntoRepeaterItemLabel( {
		id: 'background-color-variables-label',
		component: BackgroundRepeaterLabel,
		condition: ( { value }: Args ) => {
			return hasAssignedColorVariable( backgroundColorOverlayPropTypeUtil.extract( value )?.color );
		},
	} );
}

function boxShadowRepeaterInjections() {
	injectIntoRepeaterItemIcon( {
		id: 'box-shadow-color-variables-icon',
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
		id: 'filters-color-variables-icon',
		component: FilterDropShadowIconIndicator,
		condition: ( { value }: Args ) => {
			if ( ! cssFilterFunctionPropUtil.isValid( value ) ) {
				return false;
			}

			const args = cssFilterFunctionPropUtil.extract( value )?.args;
			if ( dropShadowFilterPropTypeUtil.isValid( args ) ) {
				return hasAssignedColorVariable( dropShadowFilterPropTypeUtil.extract( args )?.color );
			}

			return false;
		},
	} );

	injectIntoRepeaterItemLabel( {
		id: 'filters-drop-shadow-size-variables-label',
		component: FilterDropShadowRepeaterLabel,
		condition: ( { value }: Args ) => {
			if ( ! cssFilterFunctionPropUtil.isValid( value ) ) {
				return false;
			}

			const args = cssFilterFunctionPropUtil.extract( value )?.args;
			if ( dropShadowFilterPropTypeUtil.isValid( args ) ) {
				const { xAxis, yAxis, blur } = dropShadowFilterPropTypeUtil.extract( args ) || {};
				return (
					hasAssignedSizeVariable( xAxis ) ||
					hasAssignedSizeVariable( yAxis ) ||
					hasAssignedSizeVariable( blur )
				);
			}

			return false;
		},
	} );

	injectIntoRepeaterItemLabel( {
		id: 'filters-size-variables-label',
		component: FilterSingleSizeRepeaterLabel,
		condition: ( { value }: Args ) => {
			if ( ! cssFilterFunctionPropUtil.isValid( value ) ) {
				return false;
			}

			const args = cssFilterFunctionPropUtil.extract( value )?.args as { size?: PropValue };
			return hasAssignedSizeVariable( args?.size );
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
