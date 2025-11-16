import * as React from 'react';
import { useEffect, useState } from 'react';
import { Repeater } from '@elementor/editor-controls';
import { PlayerPlayIcon } from '@elementor/icons';
import { IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getInteractionsConfig } from '../utils/get-interactions-config';
import { InteractionDetails } from './interaction-details';

export type InteractionListProps = {
	onSelectInteraction: ( interaction: string | null ) => void;
	selectedInteraction: string | null;
	onPlayInteraction: () => void;
	triggerCreateOnShowEmpty?: boolean;
};

export function InteractionsList( props: InteractionListProps ) {
	const { onSelectInteraction, selectedInteraction, onPlayInteraction, triggerCreateOnShowEmpty } = props;

	const [ interactionId, setInteractionId ] = useState< string | null >( selectedInteraction );

	if ( triggerCreateOnShowEmpty && ! interactionId ) {
		setInteractionId( 'load-fade-in-left-100-0' );
	}

	useEffect( () => {
		if ( interactionId !== selectedInteraction ) {
			onSelectInteraction( interactionId );
		}
	}, [ interactionId, selectedInteraction, onSelectInteraction ] );

	const displayLabel = ( interactionForDisplay: string ) => {
		if ( ! interactionForDisplay ) {
			return '';
		}

		const animationOptions = getInteractionsConfig()?.animationOptions;
		const option = animationOptions.find( ( opt ) => opt.value === interactionForDisplay );

		return option?.label || interactionForDisplay;
	};

	return (
		<Repeater
			addToBottom
			openOnAdd
			openItem={ triggerCreateOnShowEmpty ? 0 : undefined }
			label={ __( 'Interactions', 'elementor' ) }
			values={ interactionId ? [ interactionId ] : [] }
			setValues={ ( newValue: string[] ) => {
				setInteractionId( newValue.length > 0 ? newValue[ 0 ] : null );
			} }
			showDuplicate={ false }
			showToggle={ false }
			isSortable={ false }
			disableAddItemButton={ !! interactionId }
			itemSettings={ {
				initialValues: interactionId ?? 'load-fade-in-left-100-0',
				Label: ( { value } ) => displayLabel( value ),
				Icon: () => null,
				Content: ( { value } ) => (
					<InteractionDetails
						interaction={ value }
						onChange={ ( newValue: string ) => {
							if ( value !== newValue ) {
								setInteractionId( newValue );
							}
						} }
					/>
				),
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
