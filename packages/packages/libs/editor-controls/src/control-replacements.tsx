import * as React from 'react';
import { type ComponentType, createContext, type PropsWithChildren, useContext } from 'react';
import { type PropValue } from '@elementor/editor-props';

import { useBoundProp } from './bound-prop-context';

type ControlComponent = ComponentType< object & { OriginalControl: ComponentType } >;
export type ControlReplacement = {
	id: string;
	component: ControlComponent;
	condition: ( { value }: ConditionArgs ) => boolean;
};

type ConditionArgs = {
	value: PropValue;
	placeholder?: PropValue;
};

type Props = PropsWithChildren< { replacements: ControlReplacement[] } >;

const ControlReplacementContext = createContext< ControlReplacement[] >( [] );
const ActiveReplacementsContext = createContext< Set< string > >( new Set() );

export const ControlReplacementsProvider = ( { replacements, children }: Props ) => {
	return <ControlReplacementContext.Provider value={ replacements }>{ children }</ControlReplacementContext.Provider>;
};

export const ActiveReplacementsProvider = ( {
	replacementId,
	children,
}: {
	replacementId: string;
	children: React.ReactNode;
} ) => {
	const parentActiveReplacements = useContext( ActiveReplacementsContext );
	const activeReplacements = new Set( parentActiveReplacements );
	activeReplacements.add( replacementId );

	return (
		<ActiveReplacementsContext.Provider value={ activeReplacements }>
			{ children }
		</ActiveReplacementsContext.Provider>
	);
};

export const useControlReplacement = ( OriginalComponent: ControlComponent ) => {
	const { value, placeholder } = useBoundProp();
	const replacements = useContext( ControlReplacementContext );
	const activeReplacements = useContext( ActiveReplacementsContext );

	try {
		const replacement = replacements.find(
			( r ) => ! activeReplacements.has( r.id ) && r.condition( { value, placeholder } )
		);

		return {
			ControlToRender: replacement?.component ?? OriginalComponent,
			isReplaced: !! replacement,
			replacementId: replacement?.id,
		};
	} catch {
		return { ControlToRender: OriginalComponent, isReplaced: false };
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
