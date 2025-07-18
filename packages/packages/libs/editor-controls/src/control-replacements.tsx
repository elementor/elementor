import * as React from 'react';
import { type ComponentType, createContext, type PropsWithChildren, useContext } from 'react';
import { type PropValue } from '@elementor/editor-props';

import { useBoundProp } from './bound-prop-context';

type ControlReplacement = {
	component: ComponentType;
	condition: ( { value }: ConditionArgs ) => boolean;
};

type ConditionArgs = {
	value: PropValue;
};

type Props = PropsWithChildren< { replacements: ControlReplacement[] } >;

const ControlReplacementContext = createContext< ControlReplacement[] >( [] );

export const ControlReplacementsProvider = ( { replacements, children }: Props ) => {
	return <ControlReplacementContext.Provider value={ replacements }>{ children }</ControlReplacementContext.Provider>;
};

export const useControlReplacement = ( OriginalComponent: ComponentType ) => {
	const { value } = useBoundProp();
	const replacements = useContext( ControlReplacementContext );

	try {
		const replacement = replacements.find( ( r ) => r.condition( { value } ) );

		return replacement?.component ?? OriginalComponent;
	} catch {
		return OriginalComponent;
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
