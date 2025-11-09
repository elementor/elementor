import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useElementInteractions } from '@elementor/editor-elements';
import { SessionStorageProvider } from '@elementor/session';

import { InteractionsProvider, useInteractionsContext } from '../contexts/interactions-context';
import { PopupStateProvider, usePopupStateContext } from '../contexts/popup-state-context';
import { EmptyState } from './empty-state';
import { PredefinedInteractionsList } from './interactions-list';

export const InteractionsTab = ( { elementId }: { elementId: string } ) => {
	const existingInteractions = useElementInteractions( elementId );
	const { triggerDefaultOpen } = usePopupStateContext();

	const [ showInteractions, setShowInteractions ] = useState( () => {
		return !! JSON.parse( existingInteractions || '[]' ).length;
	} );

	return (
		<PopupStateProvider>
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
		</PopupStateProvider>
	);
};

function InteractionsContent() {
	const { interactions, setInteractions } = useInteractionsContext();

	const applyInteraction = useCallback(
		( interaction: string ) => {
			const newInteractions = [
				{
					animation: {
						animation_type: 'full-preset',
						animation_id: interaction,
					},
				},
			];

			setInteractions( JSON.stringify( newInteractions ) );
		},
		[ setInteractions ]
	);

	const selectedInteraction = useMemo( () => {
		try {
			const parsed = JSON.parse( interactions || '[]' );
			return parsed[ 0 ]?.animation?.animation_id || '';
		} catch {
			return '';
		}
	}, [ interactions ] );

	return (
		<>
			<PredefinedInteractionsList
				selectedInteraction={ selectedInteraction }
				onSelectInteraction={ applyInteraction }
			/>
		</>
	);
}
