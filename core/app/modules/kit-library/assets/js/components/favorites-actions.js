import { useKitFavoritesMutations } from '../hooks/use-kit-favorites-mutations';
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
						elementorCommon.events.eventTracking(
							'kit-library/mark-as-favorite',
							{
								placement: 'kit library',
								event: 'favorite icon interaction',
							},
							{
								source: '/' === props.source ? 'home page' : 'overview',
								action: 'uncheck',
								kit_name: props.name,
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
						elementorCommon.events.eventTracking(
							'kit-library/mark-as-favorite',
							{
								placement: 'kit library',
								event: 'favorite icon interaction',
							},
							{
								source: '/' === props.source ? 'home page' : 'overview',
								action: 'check',
								kit_name: props.name,
								grid_location: props.index || null,
								search_term: props.queryParams || null,
							},
						)
					} }
			/>
	);
}

FavoritesActions.propTypes = {
	isFavorite: PropTypes.bool,
	id: PropTypes.string,
};
