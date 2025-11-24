import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Repeater } from '@elementor/editor-controls';
import { type ElementInteractions } from '@elementor/editor-elements';
import { PlayerPlayIcon } from '@elementor/icons';
import { IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getInteractionsConfig } from '../utils/get-interactions-config';
import {
	buildInteractionItem,
	getInteractionLabel,
} from '../utils/interactions-helpers';
import { DEFAULT_INTERACTION, InteractionDetails } from './interaction-details';

export const MAX_NUMBER_OF_INTERACTIONS = 5;

export type InteractionListProps = {
	onSelectInteractions: ( interactions: ElementInteractions ) => void;
	interactions: ElementInteractions;
	onPlayInteraction: ( interactionId: string ) => void;
	triggerCreateOnShowEmpty?: boolean;
};

export function InteractionsList( props: InteractionListProps ) {
	const { interactions, onSelectInteractions, onPlayInteraction, triggerCreateOnShowEmpty } = props;

	const [ interactionsState, setInteractionsState ] = useState< ElementInteractions >( interactions );

	useEffect( () => {
		if ( JSON.stringify( interactions.items ) !== JSON.stringify( interactionsState ) ) {
			onSelectInteractions( interactionsState );
		}
	}, [ interactions.items, interactionsState, onSelectInteractions ] );

	const isMaxNumberOfInteractionsReached = useMemo( () => {
		return interactionsState.items?.length >= MAX_NUMBER_OF_INTERACTIONS;
	}, [ interactionsState.items ] );

	if ( triggerCreateOnShowEmpty && ( ! interactionsState.items || interactionsState.items?.length === 0 ) ) {
		setInteractionsState( {
			version: 1,
			items: [ buildInteractionItem( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				direction: '',
				duration: '300',
				delay: '0',
			} ) ],
		} );
	}

	// const displayLabel = ( interactionForDisplay: string ) => {
	// 	if ( ! interactionForDisplay ) {
	// 		return '';
	// 	}

	// 	const animationOptions = getInteractionsConfig()?.animationOptions;
	// 	const option = animationOptions.find( ( opt ) => opt.value === interactionForDisplay );

	// 	return option?.label || interactionForDisplay;
	// };

	// 
	return (
		<Repeater
			openOnAdd
			openItem={ triggerCreateOnShowEmpty ? 0 : undefined }
			label={ __( 'Interactions', 'elementor' ) }
			values={ interactionsState.items }
			setValues={ ( newValue: ElementInteractions[ 'items' ] ) => {
				setInteractionsState( {
					...interactionsState,
					items: newValue,
				} );
			} }
			showDuplicate={ false }
			showToggle={ false }
			isSortable={ false }
			disableAddItemButton={ isMaxNumberOfInteractionsReached }
			itemSettings={ {
				initialValues: buildInteractionItem( {
					trigger: 'load',
					effect: 'fade',
					type: 'in',
					direction: '',
					duration: '300',
					delay: '0',
				} ),
				Label: ( { value } ) => getInteractionLabel( value ),
				Icon: () => null,
				Content: ( { index, value } ) => (
					<InteractionDetails
						key={ index }
						interactionItem={ value }
						onChange={ ( newValue ) => {
							const newInteractions = { ...interactionsState };
							newInteractions.items[ index ] = newValue;
							setInteractionsState( { ...interactionsState, items: newInteractions.items } );
						} }
					/>
				),
				actions: ( value ) => {
					const interactionId = value.interaction_id?.value || '';
					return (
						<>
							<IconButton size="tiny" onClick={ () => onPlayInteraction( interactionId ) }>
								<PlayerPlayIcon fontSize="tiny" />
							</IconButton>
						</>
					);
				},
			} }
		/>
	);
}
