import { Container, Box } from '@elementor/ui';
import TopSection from './top-section';
import PromotionBar from './side-bar-promotion';

const HomeScreen = ( props ) => {
	return (
		// Box wrapper around the Container is needed to neutralize wp-content area left-padding
		<Box sx={ { pr: 1 } }>
			<Container disableGutters={ true } maxWidth="lg" sx={ { display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 3 }, py: { xs: 2, md: 6 } } }>
				<TopSection
					topData={ props.homeScreenData.data.top }
					createNewPageUrl={ props.homeScreenData.createNewPageUrl }
				/>
			</Container>
			<Container maxWidth="xs" disableGutters={ true } sx={ { alignItems: 'space-between' } }>
				<Container flexGrow={ 1 } disableGutters={ true } sx={ { display: 'flex', flexDirection: 'column', gap: 3, py: 3 } }></Container>
				<PromotionBar sideData={ props.homeScreenData.data.sidebar_upgrade } />
			</Container>
		</Box>
	);
};

HomeScreen.propTypes = {
	homeScreenData: PropTypes.object,
};

export default HomeScreen;
