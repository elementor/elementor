import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Repeater } from '@elementor/editor-controls';
import { InfoCircleFilledIcon, PlayerPlayIcon } from '@elementor/icons';
import { Alert, AlertTitle, Box, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { InteractionDetails } from './interaction-details';
import type { InteractionItemPropValue, InteractionItemValue, InteractionsPropType } from '../types';
import {
	buildAnimationIdString,
	buildDisplayLabel,
	createDefaultInteractionItem,
	extractString,
} from '../utils/prop-value-utils';

export const MAX_NUMBER_OF_INTERACTIONS = 5;

export type InteractionListProps = {
	onSelectInteractions: ( interactions: InteractionsPropType ) => void;
	interactions: InteractionsPropType;
	onPlayInteraction: ( animationId: string ) => void;
	triggerCreateOnShowEmpty?: boolean;
};

export function InteractionsList( props: InteractionListProps ) {
	const { interactions, onSelectInteractions, onPlayInteraction, triggerCreateOnShowEmpty } = props;

	const [ interactionsState, setInteractionsState ] = useState< InteractionsPropType >( interactions );

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
			items: [ createDefaultInteractionItem() ],
		} );
	}

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
			setValues={ ( newValue: InteractionsPropType[ 'items' ] ) => {
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
				initialValues: createDefaultInteractionItem(),
				Label: ( { value }: { value: InteractionItemPropValue } ) => buildDisplayLabel( value.value ),
				Icon: () => null,
				Content: ( { index, value }: { index: number; value: InteractionItemPropValue } ) => (
					<InteractionDetails
						key={ index }
						interaction={ value.value }
						onChange={ ( newInteractionValue: InteractionItemValue ) => {
							const newItems = structuredClone( interactionsState.items );
							newItems[ index ] = {
								$$type: 'interaction-item',
								value: newInteractionValue,
							};
							setInteractionsState( { ...interactionsState, items: newItems } );
						} }
					/>
				),
				actions: ( value: InteractionItemPropValue ) => (
					<>
						<IconButton
							aria-label={ __( 'Play interaction', 'elementor' ) }
							size="tiny"
							onClick={ () => onPlayInteraction( buildAnimationIdString( value.value ) ) }
						>
							<PlayerPlayIcon fontSize="tiny" />
						</IconButton>
					</>
				),
			} }
		/>
	);
}
