/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { useQuery } from '@elementor/query';
import { getNotifications } from '../api';
import { Box, Divider, LinearProgress, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { WhatsNewItem } from './whats-new-item';
import { WhatsNewItemCollapsed } from './whats-new-item-collapsed';

export const WhatsNewDrawerContent = ( { setIsOpen, seenItemIds, onSeen, initialHasUnread } ) => {
	const { isPending, error, data: items } = useQuery( {
		queryKey: [ 'e-notifications' ],
		queryFn: getNotifications,
	} );

	// Auto-mark fully-visible items as seen so they don't inflate the badge.
	// - Featured items: always visible in the hero section.
	// - Regular items (no featured exist): all fully visible as expanded cards.
	// The seenItemIds check prevents re-dispatching on subsequent drawer opens.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect( () => {
		if ( ! items ) {
			return;
		}
		const hasFeatured = items.some( ( item ) => item.featured );
		const fullyVisibleItems = hasFeatured
			? items.filter( ( item ) => item.featured )
			: items;
		fullyVisibleItems
			.filter( ( item ) => ! seenItemIds.has( item.id ) )
			.forEach( ( item ) => onSeen( item.id ) );
	}, [ items ] );

	if ( isPending ) {
		return (
			<Box>
				<LinearProgress
					color="secondary"
				/>
			</Box>
		);
	}

	if ( error ) {
		return (
			<Box>
				An error has occurred: { error }
			</Box>
		);
	}

	const featuredItems = items.filter( ( item ) => item.featured );
	const alsoNewItems = featuredItems.length > 0 ? items.filter( ( item ) => ! item.featured ) : [];
	const regularItems = featuredItems.length > 0 ? [] : items;

	return (
		<>
			{ featuredItems.map( ( item, index ) => (
				<WhatsNewItem
					key={ index }
					item={ item }
					itemIndex={ index }
					itemsLength={ featuredItems.length }
					setIsOpen={ setIsOpen }
					featured={ true }
				/>
			) ) }
			{ alsoNewItems.length > 0 && (
				<>
					<Divider sx={ { my: 1.5 } }>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={ { px: 1, textTransform: 'uppercase', letterSpacing: '0.08em' } }
						>
							{ __( 'Also new', 'elementor' ) }
						</Typography>
					</Divider>
					{ alsoNewItems.map( ( item, index ) => (
						<WhatsNewItemCollapsed
							key={ index }
							item={ item }
							itemIndex={ index }
							isNew={ initialHasUnread && ! seenItemIds.has( item.id ) }
							onSeen={ () => onSeen( item.id ) }
						/>
					) ) }
				</>
			) }
			{ regularItems.map( ( item, itemIndex ) => (
				<WhatsNewItem
					key={ itemIndex }
					item={ item }
					itemIndex={ itemIndex }
					itemsLength={ regularItems.length }
					setIsOpen={ setIsOpen }
				/>
			) ) }
		</>
	);
};
