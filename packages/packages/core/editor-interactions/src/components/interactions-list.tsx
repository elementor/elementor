import * as React from 'react';
import { useEffect, useState } from 'react';
import { PlayerPlayIcon } from '@elementor/icons';
import { IconButton, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getInteractionsConfig } from '../utils/get-interactions-config';
import { InteractionDetails } from './interaction-details';
import { Repeater } from '@elementor/editor-controls';

type PredefinedInteractionsListProps = {
	onSelectInteraction: ( interaction: string | null ) => void;
	selectedInteraction: string;
	onPlayInteraction: () => void;
};

export const PredefinedInteractionsList = ( {
	onSelectInteraction,
	selectedInteraction,
	onPlayInteraction,
}: PredefinedInteractionsListProps ) => {
	return (
		<Stack sx={ { m: 1, p: 1.5 } } gap={ 2 }>
			<InteractionsList
				selectedInteraction={ selectedInteraction }
				onSelectInteraction={ onSelectInteraction }
				onPlayInteraction={ onPlayInteraction }
			/>
		</Stack>
	);
};

type InteractionListProps = {
	onSelectInteraction: ( interaction: string | null ) => void;
	selectedInteraction: string | null;
	onPlayInteraction: () => void;
};

function InteractionsList( props: InteractionListProps ) {
	const { onSelectInteraction, selectedInteraction, onPlayInteraction } = props;

	const [ interactionId, setInteractionId ] = useState<string | null>( selectedInteraction );

	useEffect( () => {
		if ( interactionId !== selectedInteraction ) {
			onSelectInteraction( interactionId );
		}
	}, [ interactionId, selectedInteraction, onSelectInteraction ] );

	const displayLabel = (interactionId: string) => {
		if ( ! interactionId ) {
			return '';
		}

		const animationOptions = getInteractionsConfig()?.animationOptions;
		const option = animationOptions.find( ( opt ) => opt.value === interactionId );

		return option?.label || interactionId;
	};

	return (
			<Repeater
				addToBottom
				openOnAdd
				label={ __( 'Interactions', 'elementor' ) }
				values={ interactionId ? [ interactionId ] : [] }
				setValues={ ( newValue: string[] ) => {
					setInteractionId( newValue.length > 0 ? newValue[ 0 ] : null );
				} }
				showDuplicate={ false }
				showToggle={ false }
				isSortable={ false }
				disableAddItemButton={ !!interactionId }
				itemSettings={ {
					initialValues: interactionId ?? 'load-fade-in-left-100-0',
					Label: ( { value } ) => displayLabel(value),
					Icon: () => null,
					Content: ( { value } ) => <InteractionDetails interaction={ value } onChange={ ( newValue: string ) => {
						if ( value !== newValue ) {
							setInteractionId( newValue );
						}
					} } />,
					actions: (
						<>
							<IconButton size="tiny" onClick={ onPlayInteraction }>
								<PlayerPlayIcon fontSize="tiny" />
							</IconButton>
						</>
					),
				} }
			/>
	);
}
