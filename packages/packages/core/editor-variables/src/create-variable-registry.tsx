import type * as React from 'react';
import { type PropTypeUtil } from '@elementor/editor-props';
import { type SvgIconProps } from '@elementor/ui';

type VariablesOptions = {
	valueField: ( { value, onChange }: { value: string; onChange: ( value: string ) => void } ) => React.JSX.Element;
	icon: React.ForwardRefExoticComponent< Omit< SvgIconProps, 'ref' > & React.RefAttributes< SVGSVGElement > >;
	listIcon: ( { value }: { value: string } ) => React.JSX.Element;
	variableType: string;
};

type VariablesProps = {
	[ key: string ]: VariablesOptions;
};

type RegisterProps = VariablesOptions & {
	propType: PropTypeUtil< string, string >;
};

export const createVariableRegistry = () => {
	const variables: VariablesProps = {};

	const registerVariable = ( { valueField, icon, propType, listIcon, variableType }: RegisterProps ) => {
		variables[ propType.key ] = {
			valueField,
			icon,
			listIcon,
			variableType,
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
