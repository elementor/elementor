import { type ForwardRefExoticComponent, type JSX, type RefAttributes } from 'react';
import { styleTransformersRegistry } from '@elementor/editor-canvas';
import { stylesInheritanceTransformersRegistry } from '@elementor/editor-editing-panel';
import { type createPropUtils, type PropTypeKey, type PropTypeUtil } from '@elementor/editor-props';
import { type SvgIconProps } from '@elementor/ui';

import { inheritanceTransformer } from '../transformers/inheritance-transformer';
import { variableTransformer } from '../transformers/variable-transformer';

type ValueFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
};

type FallbackPropTypeUtil = ReturnType< typeof createPropUtils >;

type VariableTypeOptions = {
	icon: ForwardRefExoticComponent< Omit< SvgIconProps, 'ref' > & RefAttributes< SVGSVGElement > >;
	startIcon?: ( { value }: { value: string } ) => JSX.Element;
	valueField: ( { value, onChange }: ValueFieldProps ) => JSX.Element;
	variableType: string;
	fallbackPropTypeUtil: FallbackPropTypeUtil;
	propTypeUtil: PropTypeUtil< string, string >;
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
		fallbackPropTypeUtil,
	}: VariableTypeOptions ) => {
		if ( variableTypes[ propTypeUtil.key ] ) {
			throw new Error( `Variable with key "${ propTypeUtil.key }" is already registered.` );
		}

		variableTypes[ propTypeUtil.key ] = {
			icon,
			startIcon,
			valueField,
			propTypeUtil,
			variableType,
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
