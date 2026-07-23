import { useEffect, useRef } from 'react';
import { useQuery } from '@elementor/query';
import { getNotifications } from '../api';
import { Box, Divider, LinearProgress, Typography } from '@elementor/ui';
import { WhatsNewItem } from './whats-new-item';
import { WhatsNewItemCollapsed } from './whats-new-item-collapsed';

export const WhatsNewDrawerContent = ( { setIsOpen, seenItemIds, onSeen, initialHasUnread } ) => {
	const { isPending, error, data: items } = useQuery( {
		queryKey: [ 'e-notifications' ],
		queryFn: getNotifications,
	} );

	const seenItemIdsRef = useRef( seenItemIds );
	seenItemIdsRef.current = seenItemIds;

	useEffect( () => {
		if ( ! items ) {
			return;
		}
		const hasFeatured = items.some( ( item ) => item.featured );
		const fullyVisibleItems = hasFeatured
			? items.filter( ( item ) => item.featured )
			: items;
		fullyVisibleItems
			.filter( ( item ) => ! seenItemIdsRef.current.has( item.id ) )
			.forEach( ( item ) => onSeen( item.id ) );
	}, [ items, onSeen ] );

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

	const isImageOnly = ( item ) => ! item.title && ! item.description && ( item.imageSrc || item.gifSrc || item.youtubeEmbedId );
	const featuredItems = items.filter( ( item ) => item.featured );
	const nonFeaturedItems = items.filter( ( item ) => ! item.featured && ! isImageOnly( item ) );
	const listLabel = items.find( ( item ) => item.listLabel )?.listLabel ?? null;

	return (
		<>
			{ featuredItems.map( ( item, index ) => (
				<WhatsNewItem
					key={ item.id }
					item={ item }
					itemIndex={ index }
					itemsLength={ featuredItems.length }
					setIsOpen={ setIsOpen }
					featured={ true }
				/>
			) ) }
			{ featuredItems.length > 0 && nonFeaturedItems.length > 0 && (
				<>
					{ listLabel
						? (
							<Divider sx={ { my: 1.5 } }>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={ { px: 1, textTransform: 'uppercase', letterSpacing: '0.08em' } }
								>
									{ listLabel }
								</Typography>
							</Divider>
						)
						: <Divider sx={ { my: 1.5 } } />
					}
					{ nonFeaturedItems.map( ( item, index ) => (
						<WhatsNewItemCollapsed
							key={ item.id }
							item={ item }
							itemIndex={ index }
							isNew={ initialHasUnread && ! seenItemIds.has( item.id ) }
							onSeen={ onSeen }
							setIsOpen={ setIsOpen }
						/>
					) ) }
				</>
			) }
			{ 0 === featuredItems.length && nonFeaturedItems.map( ( item, itemIndex ) => (
				<WhatsNewItem
					key={ item.id }
					item={ item }
					itemIndex={ itemIndex }
					itemsLength={ nonFeaturedItems.length }
					setIsOpen={ setIsOpen }
				/>
			) ) }
		</>
	);
};

WhatsNewDrawerContent.propTypes = {
	setIsOpen: PropTypes.func.isRequired,
	seenItemIds: PropTypes.instanceOf( Set ).isRequired,
	onSeen: PropTypes.func.isRequired,
	initialHasUnread: PropTypes.bool.isRequired,
};
