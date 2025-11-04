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

	const existingInteractions = useElementInteractions( element.id );

	const [ showInteractions, setShowInteractions ] = React.useState( () => {
		return !! JSON.parse( existingInteractions || '[]' ).length;
	} );

	const defaultStateRef = React.useRef( false );

	return (
		<SessionStorageProvider prefix={ element.id }>
			{ showInteractions ? (
				<SectionsList>
					<InteractionsProvider>
						<InteractionsContent defaultStateRef={ defaultStateRef } />
					</InteractionsProvider>
				</SectionsList>
			) : (
				<EmptyState
					onCreateInteraction={ () => {
						setShowInteractions( true );
						defaultStateRef.current = true;
					} }
				/>
			) }
		</SessionStorageProvider>
	);
};

function InteractionsContent( {
	defaultStateRef,
}: {
	defaultStateRef: React.MutableRefObject< boolean | undefined >;
} ) {
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
				defaultStateRef={ defaultStateRef }
			/>
		</SectionsList>
	);
}
