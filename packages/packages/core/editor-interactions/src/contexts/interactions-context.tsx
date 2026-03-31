import * as React from 'react';
import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react';
import {
	type ElementInteractions,
	getElementInteractions,
	getElementLabel,
	playElementInteractions,
	updateElementInteractions,
} from '@elementor/editor-elements';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useElementInteractions } from '../hooks/use-element-interactions';

type InteractionsContextValue = {
	elementId: string;
	interactions: ElementInteractions;
	setInteractions: ( value: ElementInteractions | undefined ) => void;
	playInteractions: ( interactionId: string ) => void;
};

type UndoablePayload = {
	interactions: ElementInteractions | undefined;
	operationType: 'apply' | 'delete';
};

const InteractionsContext = createContext< InteractionsContextValue | null >( null );

const DEFAULT_INTERACTIONS: ElementInteractions = {
	version: 1,
	items: [],
};

export const InteractionsProvider = ( { children, elementId }: { children: ReactNode; elementId: string } ) => {
	const rawInteractions = useElementInteractions( elementId );

	useEffect( () => {
		window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );
	}, [] );

	const interactions: ElementInteractions =
		( rawInteractions as unknown as ElementInteractions ) ?? DEFAULT_INTERACTIONS;

	const undoableSetInteractions = useMemo(
		() =>
			undoable(
				{
					do: ( { interactions: newInteractions }: UndoablePayload ) => {
						const previous = getElementInteractions( elementId );

						updateElementInteractions( { elementId, interactions: newInteractions } );

						return previous;
					},
					undo: ( _: UndoablePayload, previous ) => {
						updateElementInteractions( {
							elementId,
							interactions: previous?.items?.length ? previous : undefined,
						} );
					},
				},
				{
					title: getElementLabel( elementId ),
					subtitle: ( { operationType }: UndoablePayload ) =>
						operationType === 'apply'
							? __( 'Interaction Applied', 'elementor' )
							: __( 'Interaction Deleted', 'elementor' ),
				}
			),
		[ elementId ]
	);

	const setInteractions = ( value: ElementInteractions | undefined ) => {
		const normalizedValue = value && value.items?.length === 0 ? undefined : value;
		const prevItemCount = interactions.items?.length ?? 0;
		const newItemCount = normalizedValue?.items?.length ?? 0;

		if ( newItemCount > prevItemCount ) {
			undoableSetInteractions( { interactions: normalizedValue, operationType: 'apply' } );
		} else if ( newItemCount < prevItemCount ) {
			undoableSetInteractions( { interactions: normalizedValue, operationType: 'delete' } );
		} else {
			updateElementInteractions( { elementId, interactions: normalizedValue } );
		}
	};

	const playInteractions = ( interactionId: string ) => {
		playElementInteractions( elementId, interactionId );
	};

	const contextValue: InteractionsContextValue = {
		elementId,
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
