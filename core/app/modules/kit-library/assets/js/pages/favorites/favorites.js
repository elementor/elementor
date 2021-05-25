import Index from '../index/index';
import IndexNoResults from 'elementor/core/app/modules/kit-library/assets/js/pages/index/index-no-results';
import { useNavigate } from '@reach/router';

export default function Favorites( props ) {
	const navigate = useNavigate();

	return <Index
		path={ props.path }
		initialQueryParams={ { favorite: true } }
		renderNoResultsComponent={ ( { defaultComponent, isFilterActive } ) => {
			if ( ! isFilterActive ) {
				return <IndexNoResults
					title={ __( 'No favorites here yet...', 'elementor' ) }
					description={ __( 'Use the heart icon to save kits that inspire you. You\'ll be able to find them here', 'elementor' ) }
					button={ {
						text: __( 'Continue Browsing', 'elementor' ),
						action: () => navigate( '/kit-library' ),
					} }
				/>;
			}

			return defaultComponent;
		} }
	/>;
}

Favorites.propTypes = {
	path: PropTypes.string,
};
