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
import { type NormalizedVariable } from '../types';

type ValueFieldProps< TValue > = {
	value: TValue;
	onChange: ( value: TValue ) => void;
	onValidationChange?: ( errorMessage: string ) => void;
};

type FallbackPropTypeUtil = ReturnType< typeof createPropUtils >;

// type Transformer = ReturnType< typeof styleTransformersRegistry.get >;

type OptionalOptions< TValue > = {
	startIcon?: ( { value }: { value: TValue } ) => JSX.Element;
	selectionFilter?: ( variables: NormalizedVariable[], propType: PropType ) => NormalizedVariable[];
	valueTransformer?: ( value: TValue ) => PropValue;
};

type TypeOptions< TV > = OptionalOptions< TV > & {
	variableType: string;
	fallbackPropTypeUtil: FallbackPropTypeUtil;
	propTypeUtil: PropTypeUtil< string, string >;
	// transformer: Transformer;
	icon: ForwardRefExoticComponent< Omit< SvgIconProps, 'ref' > & RefAttributes< SVGSVGElement > >;
	valueField: ( { value, onChange, onValidationChange }: ValueFieldProps< TV > ) => JSX.Element;
};

export function createVariableTypeRegistry< TV >() {
	const variableTypes: Record< string, TypeOptions< TV > > = {};

	// styleTransformersRegistry.get();
	const registerVariableType = ( {
		icon,
		startIcon,
		valueField,
		// transformer,
		propTypeUtil,
		variableType,
		selectionFilter,
		valueTransformer,
		fallbackPropTypeUtil,
	}: TypeOptions< TV > ) => {
		if ( variableTypes[ propTypeUtil.key ] ) {
			throw new Error( `Variable with key "${ propTypeUtil.key }" is already registered.` );
		}

		variableTypes[ propTypeUtil.key ] = {
			icon,
			startIcon,
			valueField,
			// transformer,
			propTypeUtil,
			variableType,
			selectionFilter,
			valueTransformer,
			fallbackPropTypeUtil,
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
