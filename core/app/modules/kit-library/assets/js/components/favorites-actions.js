import { useKitFavoritesMutations } from '../hooks/use-kit-favorites-mutations';
import { Button, Icon } from '@elementor/app-ui';

export default function FavoritesActions( props ) {
	const { addToFavorites, removeFromFavorites, isLoading } = useKitFavoritesMutations();

	if ( isLoading || props.isLoading ) {
		return <Icon className="eicon-loading eicon-animation-spin e-kit-library__kit-item-favorite"/>;
	}

	return (
		props.isFavorite ?
			<Button
				text={ __( 'Remove From Favorites', 'elementor' ) }
				hideText={ true }
				icon="eicon-heart"
				className="e-kit-library__kit-item-favorite e-kit-library__kit-item-favorite--active"
				onClick={ () => ! isLoading && removeFromFavorites.mutate( props.id ) }
			/> :
			<Button
				text={ __( 'Add To Favorites', 'elementor' ) }
				hideText={ true }
				icon="eicon-heart-o"
				className="e-kit-library__kit-item-favorite"
				onClick={ () => ! isLoading && addToFavorites.mutate( props.id ) }
			/>
	);
}

FavoritesActions.propTypes = {
	isFavorite: PropTypes.bool,
	isLoading: PropTypes.bool,
	id: PropTypes.string,
};
