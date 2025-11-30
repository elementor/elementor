import * as React from 'react';
import { useCallback, useState } from 'react';
import { type ElementInteractions, useElementInteractions } from '@elementor/editor-elements';
import { SessionStorageProvider } from '@elementor/session';
import { Stack } from '@elementor/ui';

import { InteractionsProvider, useInteractionsContext } from '../contexts/interactions-context';
import { PopupStateProvider } from '../contexts/popup-state-context';
import { EmptyState } from './empty-state';
import { InteractionsList } from './interactions-list';

export const InteractionsTab = ( { elementId }: { elementId: string } ) => {
	return (
		<PopupStateProvider>
			<InteractionsTabContent elementId={ elementId } />
		</PopupStateProvider>
	);
};

function InteractionsTabContent( { elementId }: { elementId: string } ) {
	const existingInteractions = useElementInteractions( elementId );
	const firstInteractionState = useState< boolean >( false );
	const hasInteractions = existingInteractions?.items?.length || firstInteractionState[ 0 ];

	return (
		<SessionStorageProvider prefix={ elementId }>
			{ hasInteractions ? (
				<InteractionsProvider elementId={ elementId }>
					<InteractionsContent firstInteractionState={ firstInteractionState } />
				</InteractionsProvider>
			) : (
				<EmptyState
					onCreateInteraction={ () => {
						firstInteractionState[ 1 ]( true );
					} }
				/>
			) }
		</SessionStorageProvider>
	);
}

function InteractionsContent( {
	firstInteractionState,
}: {
	firstInteractionState: [ boolean, ( value: boolean ) => void ];
} ) {
	const { interactions, setInteractions, playInteractions } = useInteractionsContext();

	const applyInteraction = useCallback(
		( newInteractions: ElementInteractions ) => {
			firstInteractionState[ 1 ]( false );
			if ( ! newInteractions ) {
				setInteractions( undefined );
				return;
			}

			setInteractions( newInteractions );
		},
		[ setInteractions, firstInteractionState ]
	);

	return (
		<Stack sx={ { m: 1, p: 1.5 } } gap={ 2 }>
			<InteractionsList
				triggerCreateOnShowEmpty={ firstInteractionState[ 0 ] }
				interactions={ interactions }
				onSelectInteractions={ applyInteraction }
				onPlayInteraction={ playInteractions }
			/>
		</Stack>
	);
}
