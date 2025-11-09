import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useElementInteractions } from '@elementor/editor-elements';
import { EmptyState, PredefinedInteractionsList, usePopupStateContext } from '@elementor/editor-interactions';
import { SessionStorageProvider } from '@elementor/session';

import { useElement } from '../contexts/element-context';
import { InteractionsProvider, useInteractionsContext } from '../contexts/interaction-context';
import { SectionsList } from './sections-list';

export const InteractionsTab = () => {
	const { element } = useElement();

	const existingInteractions = useElementInteractions( element.id );
	const { triggerDefaultOpen } = usePopupStateContext();

	const [ showInteractions, setShowInteractions ] = useState( () => {
		return !! JSON.parse( existingInteractions || '[]' ).length;
	} );

	return (
		<SessionStorageProvider prefix={ element.id }>
			{ showInteractions ? (
				<SectionsList>
					<InteractionsProvider>
						<InteractionsContent />
					</InteractionsProvider>
				</SectionsList>
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
		<SectionsList>
			<PredefinedInteractionsList
				selectedInteraction={ selectedInteraction }
				onSelectInteraction={ applyInteraction }
			/>
		</SectionsList>
	);
}
