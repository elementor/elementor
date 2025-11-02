import * as React from 'react';
import { useElementInteractions } from '@elementor/editor-elements';
import { SessionStorageProvider } from '@elementor/session';

import { useElement } from '../contexts/element-context';
import { InteractionsProvider, useInteractionsContext } from '../contexts/interaction-context';
import { EmptyState } from '../interactions/components/empty-list';
import { PredefinedInteractionsList } from '../interactions/components/interactions-list';
import { SectionsList } from './sections-list';

export const InteractionsTab = () => {
	const { element } = useElement();
	const interactions = useElementInteractions( element.id );

	const [ showInteractions, setShowInteractions ] = React.useState( false );

	const hasInteractions = ( () => {
		if ( ! interactions || typeof interactions !== 'string' ) {
			return false;
		}

		try {
			const parsed = JSON.parse( interactions );
			return Array.isArray( parsed ) && parsed.length > 0;
		} catch {
			return false;
		}
	} )();

	const shouldShowInteractions = hasInteractions || showInteractions;

	return (
		<SessionStorageProvider prefix={ element.id }>
			{ shouldShowInteractions ? (
				<SectionsList>
					<InteractionsProvider>
						<InteractionsContent />
					</InteractionsProvider>
				</SectionsList>
			) : (
				<EmptyState onCreateInteraction={ () => setShowInteractions( true ) } />
			) }
		</SessionStorageProvider>
	);
};

function InteractionsContent() {
	const { interactions, setInteractions } = useInteractionsContext();

	const applyInteraction = React.useCallback(
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

	const selectedInteraction = React.useMemo( () => {
		try {
			const parsed = JSON.parse( interactions || '[]' );
			return parsed[ 0 ]?.selectedInteraction?.animation?.animation_id || '';
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
