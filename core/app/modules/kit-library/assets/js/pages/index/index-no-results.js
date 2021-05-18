import { Heading, Text, Grid, Button } from '@elementor/app-ui';
import { useMemo } from 'react';
import { useNavigate, useLocation } from '@reach/router';

import './index-no-results.scss';

function useNoResultContent( isFilterActive, clearFilter ) {
	const navigate = useNavigate();
	const location = useLocation();

	return useMemo( () => {
		const content = [
			{
				title: __( 'No favorites here yet...', 'elementor' ),
				description: __( 'Use the heart icon to save kits that inspire you. You\'ll be able to find them here', 'elementor' ),
				CTAText: __( 'Continue Browsing', 'elementor' ),
				CTAAction: () => navigate( '/kit-library' ),
				condition: () => location.pathname.includes( '/kit-library/favorites' ) && ! isFilterActive,
			},
			{
				title: __( 'No Results Found', 'elementor' ),
				description: __( 'Try retyping another keyword', 'elementor' ),
				CTAText: __( 'Continue Browsing', 'elementor' ),
				CTAAction: clearFilter,
				condition: () => true,
			},
		];

		return content.find( ( item ) => item.condition() );
	}, [ location, navigate, isFilterActive, clearFilter ] );
}

export default function IndexNoResults( props ) {
	const content = useNoResultContent(
		props.isFilterActive,
		props.clearFilter
	);

	return (
		<Grid container alignItems="center" justify="center" direction="column" className="e-kit-library__not-results">
			<img src={ `${ elementorAppConfig.assets_url }images/no-search-results.svg` }/>
			<Heading
				tag="h3"
				variant="h1"
				className="e-kit-library__not-results-title"
			>
				{ content.title }
			</Heading>
			<Text variant="xl" className="e-kit-library__not-results-description">
				{ content.description }
				<br/>
				<Button text={ content.CTAText } color="link" onClick={ content.CTAAction }/>
			</Text>
		</Grid>
	);
}

IndexNoResults.propTypes = {
	isFilterActive: PropTypes.bool,
	clearFilter: PropTypes.func.isRequired,
};
