import { Container, Box } from '@elementor/ui';
import TopSection from './top-section';
import SideBarPromotion from './sidebar-promotion';

const HomeScreen = ( props ) => {
	return (
		/*  Box wrapper around the Container is needed to neutralize wp-content area left-padding */
		<Box sx={ { pr: 1 } }>
			<Container disableGutters={ true } maxWidth="lg" sx={ { display: 'flex', flexDirection: 'column', pt: { xs: 2, md: 6 }, pb: 2 } }>
				<TopSection
					topData={ props.homeScreenData.data.top }
					createNewPageUrl={ props.homeScreenData.createNewPageUrl }
				/>
			</Container>
			<Container disableGutters={ true } sx={ { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between' } }>
				{ /* Placeholder container to ensure layout until other components are added */ }
				<Container maxWidth="md"></Container>
				<Container maxWidth="xs" disableGutters={ true } sx={ { width: { md: '305px' } } }>
					<SideBarPromotion sideData={ props.homeScreenData.data.sidebar_upgrade } />
				</Container>
			</Container>
		</Box>
	);
};

HomeScreen.propTypes = {
	homeScreenData: PropTypes.object,
};

export default HomeScreen;
