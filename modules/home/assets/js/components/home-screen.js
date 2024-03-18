import { Container, Box } from '@elementor/ui';

import TopSection from './top-section';

const HomeScreen = ( props ) => {
	return (
		// Box wrapper around the Container is needed to neutralize wp-content area left-padding
		<Box sx={ { pr: 1 } }>
			<Container disableGutters={ true } maxWidth="lg" sx={ { display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 3 }, py: { xs: 2, md: 6 } } }>
				<TopSection
					topData={ props.homeScreenData.top }
					createNewPageUrl={ props.homeScreenData.create_new_page_url }
				/>
			</Container>
		</Box>
	);
};

HomeScreen.propTypes = {
	homeScreenData: PropTypes.object,
};

export default HomeScreen;
