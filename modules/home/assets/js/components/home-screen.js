import { Container, Box, Stack } from '@elementor/ui';

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
					topData={ props.homeScreenData.top_with_licences }
					createNewPageUrl={ props.homeScreenData.create_new_page_url }
				/>
				<Box sx={ { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 3 } }>
					<Stack sx={ { flex: 1, gap: 3 } }>
						<GetStarted
							getStartedData={ props.homeScreenData.get_started }
							adminUrl={ props.adminUrl }
						/>
						<Addons
							addonsData={ props.homeScreenData.add_ons }
							adminUrl={ props.adminUrl }
						/>
					</Stack>
					<Container maxWidth="xs" disableGutters={ true } sx={ { width: { sm: '305px' }, display: 'flex', flexDirection: 'column', gap: 3 } }>
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
	adminUrl: PropTypes.string,
};

export default HomeScreen;
