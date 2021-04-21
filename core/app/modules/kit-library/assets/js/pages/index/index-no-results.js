import { Heading, Text, Grid, Button } from '@elementor/app-ui';

import './index-no-results.scss';

export default function IndexNoResults( props ) {
	return (
		<Grid container alignItems="center" justify="center" direction="column" className="e-kit-library__not-results">
			<img src={ `${ elementorAppConfig.assets_url }images/no-search-results.svg` }/>
			<Heading
				tag="h3"
				variant="h1"
				className="e-kit-library__not-results-title"
			>
				{ props.isFilteredByFavorite ? __( 'No favorites here yet...', 'elementor' ) : __( 'No Results Found', 'elementor' ) }
			</Heading>
			<Text variant="xl" className="e-kit-library__not-results-description">
				{
					props.isFilteredByFavorite ?
						__( 'Use the heart icon to save kits that inspire you. You\'ll be able to find them here', 'elementor' ) :
						__( 'Try retyping another keyword or explore the most popular kits bellow.', 'elementor' )
				}

				<br/>
				<Button text={ __( 'Continue Browsing', 'elementor' ) } color="link" onClick={ props.clearFilter }/>
			</Text>
		</Grid>
	);
}

IndexNoResults.propTypes = {
	isFilteredByFavorite: PropTypes.bool,
	clearFilter: PropTypes.func.isRequired,
};

IndexNoResults.defaultProps = {
	isFilteredByFavorite: false,
};
