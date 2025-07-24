import type * as React from 'react';
import { type PropTypeUtil } from '@elementor/editor-props';
import { type SvgIconProps } from '@elementor/ui';

type VariablesOptions = {
	valueField: ( { value, onChange }: { value: string; onChange: ( value: string ) => void } ) => React.JSX.Element;
	icon: React.ForwardRefExoticComponent< Omit< SvgIconProps, 'ref' > & React.RefAttributes< SVGSVGElement > >;
	startIcon?: ( { value }: { value: string } ) => React.JSX.Element;
	variableType: string;
	fallbackPropTypeUtil: PropTypeUtil< string, string > | PropTypeUtil< string, string | null >;
	propTypeUtil: PropTypeUtil< string, string >;
};

type VariablesProps = {
	[ key: string ]: VariablesOptions;
};

export const createVariableRegistry = () => {
	const variables: VariablesProps = {};

	const registerVariable = ( {
		valueField,
		icon,
		propTypeUtil,
		variableType,
		fallbackPropTypeUtil,
		startIcon,
	}: VariablesOptions ) => {
		if ( variables[ propTypeUtil.key ] ) {
			throw new Error( `Variable with key "${ propTypeUtil.key }" is already registered.` );
		}

		variables[ propTypeUtil.key ] = {
			valueField,
			icon,
			variableType,
			fallbackPropTypeUtil,
			propTypeUtil,
			startIcon,
		};
	};

	const getVariable = ( key: string ) => {
		return variables[ key ];
	};

	return {
		registerVariable,
		getVariable,
	};
};
