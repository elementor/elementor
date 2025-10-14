import { useKitFavoritesMutations } from '../hooks/use-kit-favorites-mutations';
import { Button } from '@elementor/app-ui';
import { useTracking } from '../context/tracking-context';

import './favorites-actions.scss';

export default function FavoritesActions( props ) {
	const { addToFavorites, removeFromFavorites, isLoading } = useKitFavoritesMutations();
	const tracking = useTracking();

	const loadingClasses = isLoading ? 'e-kit-library__kit-favorite-actions--loading' : '';

	const handleRemoveFromFavorites = () => {
		if ( isLoading ) {
			return;
		}
		tracking.trackKitlibFavoriteClicked(
			props.id,
			props?.name,
			() => removeFromFavorites.mutate( props.id ),
		);
	};

	const handleAddToFavorites = () => {
		if ( isLoading ) {
			return;
		}
		tracking.trackKitlibFavoriteClicked(
			props.id,
			props?.name,
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
