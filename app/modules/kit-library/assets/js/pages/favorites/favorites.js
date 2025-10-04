import Index from '../index/index';
import ErrorScreen from '../../components/error-screen';
import { useNavigate } from '@reach/router';
import PropTypes from 'prop-types';
import { useTracking } from '../../context/tracking-context';
import { useEffect } from 'react';

export default function Favorites( props ) {
	const navigate = useNavigate();
	const tracking = useTracking();

	// Track favorites tab opened when component mounts
	useEffect( () => {
		tracking.trackKitlibFavoriteTab();
	}, [ tracking ] );

	const indexNotResultsFavorites = <ErrorScreen
		// eslint-disable-next-line @wordpress/i18n-ellipsis
		title={ __( 'No favorites here yet...', 'elementor' ) }
		description={ __( 'Use the heart icon to save Website Templates that inspire you. You\'ll be able to find them here.', 'elementor' ) }
		button={ {
			text: __( 'Continue browsing.', 'elementor' ),
			action: () => navigate( '/kit-library' ),
		} }
	/>;

	return <Index
		path={ props.path }
		initialQueryParams={ { favorite: true } }
		renderNoResultsComponent={ ( { defaultComponent, isFilterActive } ) => {
			if ( ! isFilterActive ) {
				return indexNotResultsFavorites;
			}

			return defaultComponent;
		} }
	/>;
}

Favorites.propTypes = {
	path: PropTypes.string,
};
