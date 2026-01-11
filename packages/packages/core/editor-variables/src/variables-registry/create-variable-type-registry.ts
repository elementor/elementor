import {
	type ForwardRefExoticComponent,
	type JSX,
	type KeyboardEvent,
	type RefAttributes,
	type RefObject,
} from 'react';
import { type AnyTransformer, styleTransformersRegistry } from '@elementor/editor-canvas';
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
	onPropTypeKeyChange?: ( key: string ) => void;
	propTypeKey?: string;
	onValidationChange?: ( value: string ) => void;
	propType?: PropType;
	error?: { value: string; message: string };
	ref?: RefObject< HTMLElement | null >;
	onKeyDown?: ( event: KeyboardEvent< HTMLElement > ) => void;
};

type FallbackPropTypeUtil = ReturnType< typeof createPropUtils >;

type VariableTypeOptions = {
	icon: ForwardRefExoticComponent< Omit< SvgIconProps, 'ref' > & RefAttributes< SVGSVGElement > >;
	startIcon?: ( { value }: { value: string } ) => JSX.Element;
	valueField?: ( props: ValueFieldProps ) => JSX.Element;
	variableType: string;
	key?: string;
	defaultValue?: string;
	styleTransformer?: AnyTransformer;
	fallbackPropTypeUtil: FallbackPropTypeUtil;
	propTypeUtil: PropTypeUtil< string, string >;
	selectionFilter?: ( variables: NormalizedVariable[], propType: PropType ) => NormalizedVariable[];
	valueTransformer?: ( value: string, type?: string ) => PropValue;
	isCompatible?: ( propType: PropType, variable: Variable ) => boolean;
	emptyState?: JSX.Element;
};

export type VariableTypesMap = Record< string, Omit< VariableTypeOptions, 'key' > >;

export function createVariableTypeRegistry() {
	const variableTypes: VariableTypesMap = {};

	const registerVariableType = ( {
		key,
		icon,
		startIcon,
		valueField,
		propTypeUtil,
		variableType,
		defaultValue,
		selectionFilter,
		valueTransformer,
		styleTransformer,
		fallbackPropTypeUtil,
		isCompatible,
		emptyState,
	}: VariableTypeOptions ) => {
		const variableTypeKey = key ?? propTypeUtil.key;

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

		variableTypes[ variableTypeKey ] = {
			icon,
			startIcon,
			valueField,
			propTypeUtil,
			variableType,
			defaultValue,
			selectionFilter,
			valueTransformer,
			fallbackPropTypeUtil,
			isCompatible,
			emptyState,
		};

		registerTransformer( propTypeUtil.key, styleTransformer );
		registerInheritanceTransformer( propTypeUtil.key );
	};

	const registerTransformer = ( key: PropTypeKey, transformer?: AnyTransformer ) => {
		styleTransformersRegistry.register( key, transformer ?? variableTransformer );
	};

	const registerInheritanceTransformer = ( key: PropTypeKey ) => {
		stylesInheritanceTransformersRegistry.register( key, inheritanceTransformer );
	};

	const getVariableType = ( key: string ) => {
		return variableTypes[ key ];
	};

	const getVariableTypes = () => {
		return variableTypes;
	};

	const hasVariableType = ( key: string ) => {
		return key in variableTypes;
	};

	return {
		registerVariableType,
		getVariableType,
		getVariableTypes,
		hasVariableType,
	};
}
