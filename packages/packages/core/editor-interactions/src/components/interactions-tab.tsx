import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useElementInteractions } from '@elementor/editor-elements';
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
		const parsed = JSON.parse( existingInteractions || '{}' );
		if ( parsed && parsed?.items?.length > 0 ) {
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
		( interaction: string | null ) => {
			if ( ! interaction ) {
				setInteractions( undefined );
				return;
			}

			const newInteractions = {
				version: 1,
				items: [
					{
						animation: {
							animation_type: 'full-preset',
							animation_id: interaction,
						},
					},
				],
			};

			setInteractions( JSON.stringify( newInteractions ) );
		},
		[ setInteractions ]
	);

	const selectedInteraction = useMemo( () => {
		try {
			const parsed = JSON.parse( interactions || '{}' );
			if ( parsed && parsed?.items ) {
				return parsed.items[ 0 ]?.animation?.animation_id || '';
			}
			return '';
		} catch {
			return '';
		}
	}, [ interactions ] );

	return (
		<Stack sx={ { m: 1, p: 1.5 } } gap={ 2 }>
			<InteractionsList
				triggerCreateOnShowEmpty={ firstInteraction }
				selectedInteraction={ selectedInteraction }
				onSelectInteraction={ applyInteraction }
				onPlayInteraction={ playInteractions }
			/>
		</Stack>
	);
}
