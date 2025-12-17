import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Repeater } from '@elementor/editor-controls';
import { type ElementInteractions } from '@elementor/editor-elements';
import { InfoCircleFilledIcon, PlayerPlayIcon } from '@elementor/icons';
import { Alert, AlertTitle, Box, IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getInteractionsConfig } from '../utils/get-interactions-config';
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
		if ( JSON.stringify( interactions ) !== JSON.stringify( interactionsState ) ) {
			onSelectInteractions( interactionsState );
		}
	}, [ interactions, interactionsState, onSelectInteractions ] );

	const isMaxNumberOfInteractionsReached = useMemo( () => {
		return interactionsState.items?.length >= MAX_NUMBER_OF_INTERACTIONS;
	}, [ interactionsState.items ] );

	if ( triggerCreateOnShowEmpty && ( ! interactionsState.items || interactionsState.items?.length === 0 ) ) {
		setInteractionsState( {
			version: 1,
			items: [
				{
					animation: {
						animation_id: DEFAULT_INTERACTION,
						animation_type: 'full-preset',
					},
				},
			],
		} );
	}

	const displayLabel = ( interactionForDisplay: string ) => {
		if ( ! interactionForDisplay ) {
			return '';
		}

		const animationOptions = getInteractionsConfig()?.animationOptions;
		const option = animationOptions.find( ( opt ) => opt.value === interactionForDisplay );

		return option?.label || interactionForDisplay;
	};

	const infotipContent = isMaxNumberOfInteractionsReached ? (
		<Alert color="secondary" icon={ <InfoCircleFilledIcon /> } size="small">
			<AlertTitle>{ __( 'Interactions', 'elementor' ) }</AlertTitle>
			<Box component="span">
				{ __(
					"You've reached the limit of 5 interactions for this element. Please remove an interaction before creating a new one.",
					'elementor'
				) }
			</Box>
		</Alert>
	) : undefined;

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
			addButtonInfotipContent={ infotipContent }
			itemSettings={ {
				initialValues: {
					animation: {
						animation_id: DEFAULT_INTERACTION,
						animation_type: 'full-preset',
					},
				},
				Label: ( { value } ) => displayLabel( value.animation.animation_id ),
				Icon: () => null,
				Content: ( { index, value } ) => (
					<InteractionDetails
						key={ index }
						interaction={ value.animation.animation_id }
						onChange={ ( newValue: string ) => {
							const newInteractions = {
								...interactionsState,
								items: structuredClone( interactionsState.items ),
							};
							newInteractions.items[ index ] = {
								...newInteractions.items[ index ],
								animation: {
									...newInteractions.items[ index ].animation,
									animation_id: newValue,
								},
							};
							setInteractionsState( { ...interactionsState, items: newInteractions.items } );
						} }
					/>
				),
				actions: ( value ) => (
					<Tooltip key="preview" placement="top" title={ __( 'Preview', 'elementor' ) }>
						<IconButton
							aria-label={ __( 'Play interaction', 'elementor' ) }
							size="tiny"
							onClick={ () => onPlayInteraction( value.animation.animation_id ) }
						>
							<PlayerPlayIcon fontSize="tiny" />
						</IconButton>
					</Tooltip>
				),
			} }
		/>
	);
}
