import { useKitFavoritesMutations } from '../hooks/use-kit-favorites-mutations';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import { Button } from '@elementor/app-ui';

import './favorites-actions.scss';

export default function FavoritesActions( props ) {
	const { addToFavorites, removeFromFavorites, isLoading } = useKitFavoritesMutations();
	const loadingClasses = isLoading ? 'e-kit-library__kit-favorite-actions--loading' : '';
	const eventTracking = ( kitName, source, eventName, action, gridLocation = null, searchTerm = null ) => {
		appsEventTrackingDispatch(
			'kit-library/mark-as-favorite',
			{
				grid_location: gridLocation,
				search_term: searchTerm,
				kit_name: kitName,
				source: '/' === source ? 'home page' : 'overview',
				event: eventName,
				event_type: 'search',
				action,
			},
		);
	};
	return (
		props.isFavorite
			? <Button
					text={ __( 'Remove from Favorites', 'elementor' ) }
					hideText={ true }
					icon="eicon-heart"
					className={ `e-kit-library__kit-favorite-actions e-kit-library__kit-favorite-actions--active ${ loadingClasses }` }
					onClick={ () => {
						// eslint-disable-next-line no-unused-expressions
						! isLoading && removeFromFavorites.mutate( props.id );
						eventTracking( props?.name, props?.source, 'favorite icon interaction', 'uncheck' );
					} }
			/>
			: <Button
					text={ __( 'Add to Favorites', 'elementor' ) }
					hideText={ true }
					icon="eicon-heart-o"
					className={ `e-kit-library__kit-favorite-actions ${ loadingClasses }` }
					onClick={ () => {
						// eslint-disable-next-line no-unused-expressions
						! isLoading && addToFavorites.mutate( props.id );
						eventTracking( props?.name, props?.source, 'favorite icon interaction', 'check', props?.index, props?.queryParams );
					} }
			/>
	);
}

FavoritesActions.propTypes = {
	isFavorite: PropTypes.bool,
	id: PropTypes.string,
	name: PropTypes.string,
	index: PropTypes.number,
	queryParams: PropTypes.string,
	source: PropTypes.string,
};
