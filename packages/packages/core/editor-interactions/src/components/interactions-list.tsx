import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Repeater } from '@elementor/editor-controls';
import { InfoCircleFilledIcon, PlayerPlayIcon } from '@elementor/icons';
import { Alert, AlertTitle, Box, IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import type { ElementInteractions, InteractionItemPropValue, InteractionItemValue } from '../types';
import { buildDisplayLabel, createDefaultInteractionItem, extractString } from '../utils/prop-value-utils';
import { InteractionDetails } from './interaction-details';
export const MAX_NUMBER_OF_INTERACTIONS = 5;

export type InteractionListProps = {
	onSelectInteractions: ( interactions: ElementInteractions ) => void;
	interactions: ElementInteractions;
	onPlayInteraction: ( interactionId: string ) => void;
	triggerCreateOnShowEmpty?: boolean;
};

type InteractionItemContextValue = {
	onInteractionChange: ( index: number, newInteractionValue: InteractionItemValue ) => void;
	onPlayInteraction: ( interactionId: string ) => void;
};

const InteractionItemContext = createContext< InteractionItemContextValue | null >( null );

export function InteractionsList( props: InteractionListProps ) {
	const { interactions, onSelectInteractions, onPlayInteraction, triggerCreateOnShowEmpty } = props;

	const hasInitializedRef = useRef( false );

	const handleUpdateInteractions = useCallback(
		( newInteractions: ElementInteractions ) => {
			onSelectInteractions( newInteractions );
		},
		[ onSelectInteractions ]
	);

	useEffect( () => {
		if (
			triggerCreateOnShowEmpty &&
			! hasInitializedRef.current &&
			( ! interactions.items || interactions.items?.length === 0 )
		) {
			hasInitializedRef.current = true;
			const newState: ElementInteractions = {
				version: 1,
				items: [ createDefaultInteractionItem() ],
			};
			handleUpdateInteractions( newState );
		}
	}, [ triggerCreateOnShowEmpty, interactions.items, handleUpdateInteractions ] );

	const isMaxNumberOfInteractionsReached = useMemo( () => {
		return interactions.items?.length >= MAX_NUMBER_OF_INTERACTIONS;
	}, [ interactions.items?.length ] );

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

	const handleRepeaterChange = useCallback(
		( newItems: ElementInteractions[ 'items' ] ) => {
			handleUpdateInteractions( {
				...interactions,
				items: newItems,
			} );
		},
		[ interactions, handleUpdateInteractions ]
	);

	const handleInteractionChange = useCallback(
		( index: number, newInteractionValue: InteractionItemValue ) => {
			const newItems = structuredClone( interactions.items );
			newItems[ index ] = {
				$$type: 'interaction-item',
				value: newInteractionValue,
			};
			handleUpdateInteractions( {
				...interactions,
				items: newItems,
			} );
		},
		[ interactions, handleUpdateInteractions ]
	);

	const contextValue = useMemo(
		() => ( {
			onInteractionChange: handleInteractionChange,
			onPlayInteraction,
		} ),
		[ handleInteractionChange, onPlayInteraction ]
	);

	return (
		<InteractionItemContext.Provider value={ contextValue }>
			<Repeater
				openOnAdd
				openItem={ triggerCreateOnShowEmpty ? 0 : undefined }
				label={ __( 'Interactions', 'elementor' ) }
				values={ interactions.items }
				setValues={ handleRepeaterChange }
				showDuplicate={ false }
				showToggle={ false }
				isSortable={ false }
				disableAddItemButton={ isMaxNumberOfInteractionsReached }
				addButtonInfotipContent={ infotipContent }
				itemSettings={ {
					initialValues: createDefaultInteractionItem(),
					Label: ( { value }: { value: InteractionItemPropValue } ) => buildDisplayLabel( value.value ),
					Icon: () => null,
					Content,
					actions: ( value: InteractionItemPropValue ) => (
						<Tooltip key="preview" placement="top" title={ __( 'Preview', 'elementor' ) }>
							<IconButton
								aria-label={ __( 'Play interaction', 'elementor' ) }
								size="tiny"
								onClick={ () => onPlayInteraction( extractString( value.value.interaction_id ) ) }
							>
								<PlayerPlayIcon fontSize="tiny" />
							</IconButton>
						</Tooltip>
					),
				} }
			/>
		</InteractionItemContext.Provider>
	);
}

const Content = ( { index, value }: { index: number; value: InteractionItemPropValue } ) => {
	const context = useContext( InteractionItemContext );

	const handleChange = useCallback(
		( newInteractionValue: InteractionItemValue ) => {
			context?.onInteractionChange( index, newInteractionValue );
		},
		[ context, index ]
	);

	const handlePlayInteraction = useCallback(
		( interactionId: string ) => {
			context?.onPlayInteraction( interactionId );
		},
		[ context ]
	);

	return (
		<InteractionDetails
			key={ index }
			interaction={ value.value }
			onChange={ handleChange }
			onPlayInteraction={ handlePlayInteraction }
		/>
	);
};
