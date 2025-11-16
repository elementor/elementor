import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useElementInteractions } from '@elementor/editor-elements';
import { SessionStorageProvider } from '@elementor/session';

import { InteractionsProvider, useInteractionsContext } from '../contexts/interactions-context';
import { PopupStateProvider, usePopupStateContext } from '../contexts/popup-state-context';
import { EmptyState } from './empty-state';
import { PredefinedInteractionsList } from './interactions-list';

export const InteractionsTab = ( { elementId }: { elementId: string } ) => {
	return (
		<PopupStateProvider>
			<InteractionsTabContent elementId={ elementId } />
		</PopupStateProvider>
	);
};

function InteractionsTabContent( { elementId }: { elementId: string } ) {
	const existingInteractions = useElementInteractions( elementId );
	const { triggerDefaultOpen } = usePopupStateContext();

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
					<InteractionsContent />
				</InteractionsProvider>
			) : (
				<EmptyState
					onCreateInteraction={ () => {
						setShowInteractions( true );
						triggerDefaultOpen();
					} }
				/>
			) }
		</SessionStorageProvider>
	);
}

function InteractionsContent() {
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
		<>
			<PredefinedInteractionsList
				selectedInteraction={ selectedInteraction }
				onSelectInteraction={ applyInteraction }
				onPlayInteraction={ playInteractions }
			/>
		</>
	);
}
