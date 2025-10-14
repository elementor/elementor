import { useKitFavoritesMutations } from '../hooks/use-kit-favorites-mutations';
import { Button } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import { useTracking } from '../context/tracking-context';

import './favorites-actions.scss';

export default function FavoritesActions( props ) {
	const { addToFavorites, removeFromFavorites, isLoading } = useKitFavoritesMutations();
	const tracking = useTracking();

	const loadingClasses = isLoading ? 'e-kit-library__kit-favorite-actions--loading' : '';

	const eventTracking = ( kitName, source, action, gridLocation = null, searchTerm = null ) => {
		appsEventTrackingDispatch(
			'kit-library/favorite-icon',
			{
				grid_location: gridLocation,
				search_term: searchTerm,
				kit_name: kitName,
				page_source: source && ( '/' === source ? 'home page' : 'overview' ),
				element_location: source && 'overview' === source ? 'app_sidebar' : null,
				action,
			},
		);
	};

	const handleRemoveFromFavorites = () => {
		if ( isLoading ) {
			return;
		}
		eventTracking( props?.name, props?.source, 'uncheck' );
		tracking.trackKitlibFavoriteClicked(
			props.id,
			props?.name,
			false,
			() => removeFromFavorites.mutate( props.id ),
		);
	};

	const handleAddToFavorites = () => {
		if ( isLoading ) {
			return;
		}
		eventTracking( props?.name, props?.source, 'check', props?.index, props?.queryParams );
		tracking.trackKitlibFavoriteClicked(
			props.id,
			props?.name,
			true,
			() => addToFavorites.mutate( props.id ),
		);
	};

	return (
		props.isFavorite
			? (
				<Button
					text={ __( 'Remove from Favorites', 'elementor' ) }
					hideText={ true }
					icon="eicon-heart"
					className={ `e-kit-library__kit-favorite-actions e-kit-library__kit-favorite-actions--active ${ loadingClasses }` }
					onClick={ handleRemoveFromFavorites }
				/>
			) : (
				<Button
					text={ __( 'Add to Favorites', 'elementor' ) }
					hideText={ true }
					icon="eicon-heart-o"
					className={ `e-kit-library__kit-favorite-actions ${ loadingClasses }` }
					onClick={ handleAddToFavorites }
				/>
			)
	);
}

FavoritesActions.propTypes = {
	isFavorite: PropTypes.bool,
	id: PropTypes.string,
	name: PropTypes.string,
	source: PropTypes.string,
	index: PropTypes.number,
	queryParams: PropTypes.string,
};
