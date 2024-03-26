import { Container, Box } from '@elementor/ui';

import TopSection from './top-section';
import SideBarPromotion from './sidebar-promotion';
import Addons from './addons-section';
import ExternalLinksSection from './external-links-section';
import GetStarted from './get-started-section';

const HomeScreen = ( props ) => {
	const hasSidebarUpgrade = props.homeScreenData.hasOwnProperty( 'sidebar_upgrade' );

	return (
		/*  Box wrapper around the Container is needed to neutralize wp-content area left-padding */
		<Box sx={ { pr: 1 } }>
			<Container disableGutters={ true } maxWidth="lg" sx={ { display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 3 }, pt: { xs: 2, md: 6 }, pb: 2 } }>
				<TopSection
					topData={ props.homeScreenData.top }
					createNewPageUrl={ props.homeScreenData.create_new_page_url }
				/>
				<Box sx={ { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 3 } }>
					<Box sx={ { flex: 1 } }>
						<GetStarted getStartedData={ props.homeScreenData.get_started } />
					</Box>
					<Container maxWidth="xs" disableGutters={ true } sx={ { width: { sm: '305px' } } }>
						{ hasSidebarUpgrade &&
							<SideBarPromotion sideData={ props.homeScreenData.sidebar_upgrade } />
						}
						<ExternalLinksSection externalLinksData={ props.homeScreenData.external_links } />
					</Container>
				</Box>
			</Container>
		</Box>
	);
};

HomeScreen.propTypes = {
	homeScreenData: PropTypes.object,
};

export default HomeScreen;
