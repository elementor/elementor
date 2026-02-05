import { type ForwardRefExoticComponent, type JSX, type KeyboardEvent, type RefAttributes } from 'react';
import {
	type AnyTransformer,
	stylesInheritanceTransformersRegistry,
	styleTransformersRegistry,
} from '@elementor/editor-canvas';
import {
	type createPropUtils,
	type PropType,
	type PropTypeKey,
	type PropTypeUtil,
	type PropValue,
} from '@elementor/editor-props';
import { type SvgIconProps } from '@elementor/ui';

import { type VariableManagerMenuAction } from '../components/variables-manager/ui/variable-edit-menu';
import { inheritanceTransformer } from '../transformers/inheritance-transformer';
import { variableTransformer } from '../transformers/variable-transformer';
import { type NormalizedVariable, type Variable } from '../types';

export type MenuActionContext = {
	variable: Variable;
	variableId: string;
	handlers: {
		onStartSync: ( id: string ) => void;
		onStopSync: ( id: string ) => void;
	};
};

export type MenuActionsFactory = ( context: MenuActionContext ) => VariableManagerMenuAction[];

export type ValueFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
	onPropTypeKeyChange?: ( key: string ) => void;
	propTypeKey?: string;
	onValidationChange?: ( value: string ) => void;
	propType?: PropType;
	error?: { value: string; message: string };
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
	selectionFilter?: ( variables: NormalizedVariable[], propType?: PropType ) => NormalizedVariable[];
	valueTransformer?: ( value: string, type?: string ) => PropValue;
	isCompatible?: ( propType: PropType, variable: Variable ) => boolean;
	emptyState?: JSX.Element;
	isActive?: boolean;
	menuActionsFactory?: MenuActionsFactory;
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
		isActive = true,
		menuActionsFactory,
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
			isActive,
			menuActionsFactory,
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
		return key in variableTypes && !! variableTypes[ key ].isActive;
	};

	return {
		registerVariableType,
		getVariableType,
		getVariableTypes,
		hasVariableType,
	};
}
