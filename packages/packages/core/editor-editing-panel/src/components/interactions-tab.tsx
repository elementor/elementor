import * as React from 'react';
import { useElementInteractions } from '@elementor/editor-elements';
import { SessionStorageProvider } from '@elementor/session';

import { InteractionsSection } from '../components/interactions-sections/interactions-section';
import { useElement } from '../contexts/element-context';
import { EmptyState } from '../interactions/components/empty-list';
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
					<InteractionsSection />
				</SectionsList>
			) : (
				<EmptyState onCreateInteraction={ () => setShowInteractions( true ) } />
			) }
		</SessionStorageProvider>
	);
};
