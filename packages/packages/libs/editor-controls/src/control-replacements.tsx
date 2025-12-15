import * as React from 'react';
import { type ComponentType, createContext, type PropsWithChildren, useContext } from 'react';
import { type PropValue } from '@elementor/editor-props';

import { useBoundProp } from './bound-prop-context';

type ControlComponent = ComponentType< object & { OriginalControl: ComponentType } >;
type ControlReplacement = {
	component: ControlComponent;
	condition: ( { value }: ConditionArgs ) => boolean;
};

type ConditionArgs = {
	value: PropValue;
	placeholder?: PropValue;
};

type Props = PropsWithChildren< { replacements: ControlReplacement[] } >;

const ControlReplacementContext = createContext< ControlReplacement[] >( [] );

export const ControlReplacementsProvider = ( { replacements, children }: Props ) => {
	return <ControlReplacementContext.Provider value={ replacements }>{ children }</ControlReplacementContext.Provider>;
};

export const useControlReplacement = ( OriginalComponent: ControlComponent ) => {
	const { value, placeholder } = useBoundProp();
	const replacements = useContext( ControlReplacementContext );

	try {
		const replacement = replacements.find( ( r ) => r.condition( { value, placeholder } ) );

		return {
			ControlToRender: replacement?.component ?? OriginalComponent,
			OriginalControl: OriginalComponent,
			isReplaced: !! replacement,
		};
	} catch {
		return { ControlToRender: OriginalComponent, OriginalControl: OriginalComponent };
	}
};

export const createControlReplacementsRegistry = () => {
	const controlReplacements: ControlReplacement[] = [];

	function registerControlReplacement( replacement: ControlReplacement ) {
		controlReplacements.push( replacement );
	}

	function getControlReplacements() {
		return controlReplacements;
	}

	return { registerControlReplacement, getControlReplacements };
};
