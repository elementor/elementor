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
				{ __( 'No results matched your search.', 'elementor' ) }
			</Heading>
			<Text variant="xl" className="e-kit-library__not-results-description">
				{ __( 'Try different keywords or continue browsing.', 'elementor' ) }
				<br/>
				<Button text={ __( 'Continue Browsing', 'elementor' ) } color="link" onClick={ props.clearFilter }/>
			</Text>
		</Grid>
	);
}

IndexNoResults.propTypes = {
	clearFilter: PropTypes.func.isRequired,
};
