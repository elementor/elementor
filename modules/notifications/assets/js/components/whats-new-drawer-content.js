import { useQuery } from '@elementor/query';
import { getNotifications } from '../api';
import { Box, LinearProgress } from '@elementor/ui';
import { WhatsNewItem } from './whats-new-item';

export const WhatsNewDrawerContent = ( { setIsOpen } ) => {
	const { isPending, error, data: items } = useQuery( {
		queryKey: [ 'e-notifications' ],
		queryFn: getNotifications,
	} );

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

	return (
		items.map( ( item, itemIndex ) => {
			return (
				<WhatsNewItem
					key={ itemIndex }
					item={ item }
					itemIndex={ itemIndex }
					itemsLength={ items.length }
					setIsOpen={ setIsOpen }
				/>
			);
		} )
	);
};

WhatsNewDrawerContent.propTypes = {
	setIsOpen: PropTypes.func.isRequired,
};
