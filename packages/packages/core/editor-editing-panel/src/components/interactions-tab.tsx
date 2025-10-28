import * as React from 'react';
import { useElementInteractions } from '../../../../libs/editor-elements/src/hooks/use-element-interactions';
import { SwipeIcon } from '@elementor/icons';
import { SessionStorageProvider } from '@elementor/session';
import { Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { InteractionsSection } from '../components/interactions-sections/interactions-section';
import { useElement } from '../contexts/element-context';
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
				<Stack
					alignItems="center"
					justifyContent="center"
					height="100%"
					color="text.secondary"
					sx={ { p: 2.5, pt: 8, pb: 5.5 } }
					gap={ 1.5 }
				>
					<SwipeIcon fontSize="large" />

					<Typography align="center" variant="subtitle2">
						{ __( 'Animate elements with Interactions', 'elementor' ) }
					</Typography>

					<Typography align="center" variant="caption" maxWidth="170px">
						{ __(
							'Add entrance animations and effects triggered by user interactions such as click, hover, or scroll.',
							'elementor'
						) }
					</Typography>

					<Button
						variant="outlined"
						color="secondary"
						size="small"
						sx={ { mt: 1 } }
						onClick={ () => setShowInteractions( true ) }
					>
						{ __( 'Create an interaction', 'elementor' ) }
					</Button>
				</Stack>
			) }
		</SessionStorageProvider>
	);
};
