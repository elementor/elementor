import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useElementInteractions, type ElementInteractions } from '@elementor/editor-elements';
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
	const [ firstInteraction, setFirstInteraction ] = useState< boolean >( false );
	const [ showInteractions, setShowInteractions ] = useState( () => {
		if ( existingInteractions?.items?.length > 0 ) {
			return true;
		}
		return false;
	} );

	return (
		<SessionStorageProvider prefix={ elementId }>
			{ showInteractions ? (
				<InteractionsProvider elementId={ elementId }>
					<InteractionsContent firstInteraction={ firstInteraction } />
				</InteractionsProvider>
			) : (
				<EmptyState
					onCreateInteraction={ () => {
						setFirstInteraction( true );
						setShowInteractions( true );
					} }
				/>
			) }
		</SessionStorageProvider>
	);
}

function InteractionsContent( { firstInteraction }: { firstInteraction: boolean } ) {
	const { interactions, setInteractions, playInteractions } = useInteractionsContext();

	const applyInteraction = useCallback(
		( interactions: ElementInteractions ) => {
			if ( ! interactions ) {
				setInteractions( undefined );
				return;
			}

			setInteractions( interactions );
		},
		[ setInteractions ]
	);

	return (
		<Stack sx={ { m: 1, p: 1.5 } } gap={ 2 }>
			<InteractionsList
				triggerCreateOnShowEmpty={ firstInteraction }
				interactions={ interactions }
				onSelectInteractions={ applyInteraction }
				onPlayInteraction={ playInteractions }
			/>
		</Stack>
	);
}
