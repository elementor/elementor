import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Repeater } from '@elementor/editor-controls';
import { InfoCircleFilledIcon, PlayerPlayIcon } from '@elementor/icons';
import { Alert, AlertTitle, Box, IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { InteractionItemContextProvider } from '../contexts/interactions-item-context';
import type { ElementInteractions, InteractionItemPropValue, InteractionItemValue } from '../types';
import { isSupportedInteraction } from '../utils/is-supported-interaction';
import { buildDisplayLabel, createDefaultInteractionItem, extractString } from '../utils/prop-value-utils';
import { InteractionsListItem } from './interactions-list-item';
import { ProInteractionDisabledContent } from './pro-interaction-disabled-content';

export const MAX_NUMBER_OF_INTERACTIONS = 5;

export type InteractionListProps = {
	onSelectInteractions: ( interactions: ElementInteractions ) => void;
	interactions: ElementInteractions;
	onPlayInteraction: ( interactionId: string ) => void;
	triggerCreateOnShowEmpty?: boolean;
};

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

	const [ promoPopover, setPromoPopover ] = useState< {
		open: boolean;
		anchorEl: HTMLElement | null;
	} >( { open: false, anchorEl: null } );

	return (
		<InteractionItemContextProvider value={ contextValue }>
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
					isOpenDisabled: ( value: InteractionItemPropValue ) => ! isSupportedInteraction( value ),
					onDisabledItemClick: ( value, anchorEl ) => {
						setPromoPopover( { open: true, anchorEl } );
					},
					Label: ( { value } ) => buildDisplayLabel( value.value ),
					Icon: () => null,
					Content: InteractionsListItem,
					actions: ( value: InteractionItemPropValue ) => {
						const notSupported = ! isSupportedInteraction( value );

						const playHandler = notSupported
							? undefined
							: () => {
									onPlayInteraction( extractString( value.value.interaction_id ) );
							  };

						return (
							<Tooltip key="preview" placement="top" title={ __( 'Preview', 'elementor' ) }>
								<IconButton
									aria-label={ __( 'Play interaction', 'elementor' ) }
									size="tiny"
									onClick={ playHandler }
									disabled={ notSupported }
								>
									<PlayerPlayIcon fontSize="tiny" />
								</IconButton>
							</Tooltip>
						);
					},
				} }
			/>
			<ProInteractionDisabledContent promoPopover={ promoPopover } setPromoPopover={ setPromoPopover } />
		</InteractionItemContextProvider>
	);
}
