import { useKitFavoritesMutations } from '../hooks/use-kit-favorites-mutations';
import { eventTrackingDispatch } from 'elementor-app/event-track/events';
import { Button } from '@elementor/app-ui';

import './favorites-actions.scss';

export default function FavoritesActions( props ) {
	const { addToFavorites, removeFromFavorites, isLoading } = useKitFavoritesMutations();

	const loadingClasses = isLoading ? 'e-kit-library__kit-favorite-actions--loading' : '';
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
						eventTrackingDispatch(
							'kit-library/mark-as-favorite',
							{
								kit_name: props.name,
								event: 'favorite icon interaction',
								source: '/' === props.source ? 'home page' : 'overview',
								event_type: 'search',
								action: 'uncheck',
							},
						)
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
						eventTrackingDispatch(
							'kit-library/mark-as-favorite',
							{
								grid_location: props.index,
								search_term: props.queryParams,
								kit_name: props.name,
								source: '/' === props.source ? 'home page' : 'overview',
								event: 'favorite icon interaction',
								event_type: 'search',
								action: 'check',
							},
						)
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
