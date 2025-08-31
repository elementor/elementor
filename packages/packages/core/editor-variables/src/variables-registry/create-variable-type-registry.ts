import { type ForwardRefExoticComponent, type JSX, type RefAttributes } from 'react';
import { styleTransformersRegistry } from '@elementor/editor-canvas';
import { stylesInheritanceTransformersRegistry } from '@elementor/editor-editing-panel';
import {
	type createPropUtils,
	type PropType,
	type PropTypeKey,
	type PropTypeUtil,
	type PropValue,
} from '@elementor/editor-props';
import { type SvgIconProps } from '@elementor/ui';

import { inheritanceTransformer } from '../transformers/inheritance-transformer';
import { variableTransformer } from '../transformers/variable-transformer';
import { type NormalizedVariable, type Variable } from '../types';

export type ValueFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
	onValidationChange?: ( value: string ) => void;
	propType?: PropType;
};

type FallbackPropTypeUtil = ReturnType< typeof createPropUtils >;

type VariableTypeOptions = {
	icon: ForwardRefExoticComponent< Omit< SvgIconProps, 'ref' > & RefAttributes< SVGSVGElement > >;
	startIcon?: ( { value }: { value: string } ) => JSX.Element;
	valueField: ( { value, onChange, onValidationChange, propType }: ValueFieldProps ) => JSX.Element;
	variableType: string;
	fallbackPropTypeUtil: FallbackPropTypeUtil;
	propTypeUtil: PropTypeUtil< string, string >;
	selectionFilter?: ( variables: NormalizedVariable[], propType: PropType ) => NormalizedVariable[];
	valueTransformer?: ( value: string ) => PropValue;
	isCompatible?: ( propType: PropType, variable: Variable ) => boolean;
};

export type VariableTypesMap = Record< string, VariableTypeOptions >;

export function createVariableTypeRegistry() {
	const variableTypes: VariableTypesMap = {};

	const registerVariableType = ( {
		icon,
		startIcon,
		valueField,
		propTypeUtil,
		variableType,
		selectionFilter,
		valueTransformer,
		fallbackPropTypeUtil,
		isCompatible,
	}: VariableTypeOptions ) => {
		if ( variableTypes[ propTypeUtil.key ] ) {
			throw new Error( `Variable with key "${ propTypeUtil.key }" is already registered.` );
		}

		if ( ! isCompatible ) {
			isCompatible = ( propType, variable: Variable ) => {
				if ( 'union' === propType.kind ) {
					if ( variable.type in propType.prop_types ) {
						return true;
					}
				}
				return false;
			};
		}

		variableTypes[ propTypeUtil.key ] = {
			icon,
			startIcon,
			valueField,
			propTypeUtil,
			variableType,
			selectionFilter,
			valueTransformer,
			fallbackPropTypeUtil,
			isCompatible,
		};

		registerTransformer( propTypeUtil.key );
		registerInheritanceTransformer( propTypeUtil.key );
	};

	const registerTransformer = ( key: PropTypeKey ) => {
		styleTransformersRegistry.register( key, variableTransformer );
	};

	const registerInheritanceTransformer = ( key: PropTypeKey ) => {
		stylesInheritanceTransformersRegistry.register( key, inheritanceTransformer );
	};

	const getVariableType = ( key: string ) => {
		return variableTypes[ key ];
	};

	const hasVariableType = ( key: string ) => {
		return key in variableTypes;
	};

	return {
		registerVariableType,
		getVariableType,
		hasVariableType,
	};
}
