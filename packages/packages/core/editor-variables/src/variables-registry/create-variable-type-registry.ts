import { type ForwardRefExoticComponent, type JSX, type RefAttributes } from 'react';
import { type PropTypeUtil } from '@elementor/editor-props';
import { type SvgIconProps } from '@elementor/ui';

type ValueFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
};

type FallbackPropTypeUtil = PropTypeUtil< string, string > | PropTypeUtil< string, string | null >;

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
	};

	const getVariableType = ( key: string ) => {
		return variableTypes[ key ];
	};

	return {
		registerVariableType,
		getVariableType,
	};
}
