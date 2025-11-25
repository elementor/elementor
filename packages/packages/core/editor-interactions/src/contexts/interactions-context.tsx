import * as React from 'react';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import {
	type ElementInteractions,
	playElementInteractions,
	updateElementInteractions,
	useElementInteractions,
} from '@elementor/editor-elements';

import { sanitizeInteractionsForSave } from '../utils/interactions-helpers';

type InteractionsContextValue = {
	interactions: ElementInteractions;
	setInteractions: ( value: ElementInteractions | undefined ) => void;
	playInteractions: ( animationId: string ) => void;
};

const InteractionsContext = createContext< InteractionsContextValue | null >( null );

export const InteractionsProvider = ( { children, elementId }: { children: ReactNode; elementId: string } ) => {
	const interactions = useElementInteractions( elementId );

	useEffect( () => {
		window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );
	}, [] );

	const setInteractions = ( value: ElementInteractions | undefined ) => {

		const sanitizedValue = value ? {
			...value,
			items: sanitizeInteractionsForSave( value.items ),
		} : undefined;

		updateElementInteractions( {
			elementId,
			interactions: value,
		} );
	};

	const playInteractions = ( animationId: string ) => {
		playElementInteractions( elementId, animationId );
	};

	const contextValue: InteractionsContextValue = {
		interactions,
		setInteractions,
		playInteractions,
	};

	return <InteractionsContext.Provider value={ contextValue }>{ children }</InteractionsContext.Provider>;
};

export const useInteractionsContext = () => {
	const context = useContext( InteractionsContext );
	if ( ! context ) {
		throw new Error( 'useInteractionsContext must be used within InteractionsProvider' );
	}
	return context;
};
