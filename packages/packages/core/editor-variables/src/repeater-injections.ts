import { injectIntoRepeaterItemIcon, injectIntoRepeaterItemLabel } from '@elementor/editor-controls';
import {
	backgroundColorOverlayPropTypeUtil,
	cssFilterFunctionPropUtil,
	dropShadowFilterPropTypeUtil,
	moveTransformPropTypeUtil,
	type PropValue,
	selectionSizePropTypeUtil,
	shadowPropTypeUtil,
} from '@elementor/editor-props';

import {
	BackgroundRepeaterColorIndicator,
	BackgroundRepeaterLabel,
	BoxShadowRepeaterColorIndicator,
	BoxShadowRepeaterLabel,
	FilterDropShadowIconIndicator,
	FilterDropShadowRepeaterLabel,
	FilterSingleSizeRepeaterLabel,
	TransformRepeaterLabel,
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
	transformRepeaterInjections();
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
			const { color } = shadowPropTypeUtil.extract( value ) || {};
			return hasAssignedColorVariable( color );
		},
	} );

	injectIntoRepeaterItemLabel( {
		id: 'color-variables-box-shadow-label',
		component: BoxShadowRepeaterLabel,
		condition: ( { value }: Args ) => {
			const { hOffset, vOffset, blur, spread } = shadowPropTypeUtil.extract( value ) || {};

			return (
				hasAssignedSizeVariable( hOffset ) ||
				hasAssignedSizeVariable( vOffset ) ||
				hasAssignedSizeVariable( blur ) ||
				hasAssignedSizeVariable( spread )
			);
		},
	} );
}

function transformRepeaterInjections() {
	injectIntoRepeaterItemLabel( {
		id: 'transform-size-variables-label',
		component: TransformRepeaterLabel,
		condition: ( { value }: Args ) => {
			if ( moveTransformPropTypeUtil.isValid( value ) ) {
				const { x: xAxis, y: yAxis, z: zAxis } = moveTransformPropTypeUtil.extract( value ) || {};
				return (
					hasAssignedSizeVariable( xAxis ) ||
					hasAssignedSizeVariable( yAxis ) ||
					hasAssignedSizeVariable( zAxis )
				);
			}

			return false;
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

			const args = cssFilterFunctionPropUtil.extract( value )?.args as { value?: { size?: PropValue } };
			return hasAssignedSizeVariable( args?.value?.size );
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
