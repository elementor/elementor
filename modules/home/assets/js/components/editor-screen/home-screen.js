import { Container, Box, Stack } from '@elementor/ui';

import HeaderSection from './header-section';
import TopSection from './top-section';
import SideBarPromotion from './sidebar-promotion';
import Addons from './addons-section';
import ExternalLinksSection from './external-links-section';
import GetStarted from './get-started-section';
import CreateWithAIBanner from './create-with-ai-banner';

const EditorScreen = ( props ) => {
	const hasSidebarPromotion = props.homeScreenData.hasOwnProperty( 'sidebar_promotion_variants' );

	return (
		/*  Box wrapper around the Container is needed to neutralize wp-content area left-padding */
		<Box sx={ { pr: 1 } }>
			<Container disableGutters={ true } maxWidth="lg" sx={ { display: 'flex', flexDirection: 'column', gap: 2.5, px: { xs: 1.5, md: 4 } } }>
				<HeaderSection editWebsiteUrl={ props.homeScreenData.edit_website_url } />
				{ props.homeScreenData.top_with_licences && <TopSection topData={ props.homeScreenData.top_with_licences } buttonCtaUrl={ props.homeScreenData.button_cta_url } /> }
				<Box sx={ { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2.5 } }>
					<Stack sx={ { flex: 1, gap: 2.5 } }>
						{ props.homeScreenData.create_with_ai && <CreateWithAIBanner createWithAIData={ props.homeScreenData.create_with_ai } /> }
						<GetStarted
							getStartedData={ props.homeScreenData.get_started }
							adminUrl={ props.adminUrl }
						/>
						{ props.homeScreenData.add_ons && (
							<Addons
								addonsData={ props.homeScreenData.add_ons }
								adminUrl={ props.adminUrl }
							/>
						) }
						<ExternalLinksSection externalLinksData={ props.homeScreenData.external_links } />
					</Stack>
					<Container maxWidth="xs" disableGutters={ true } sx={ { width: { sm: '305px' }, display: 'flex', flexDirection: 'column', gap: 2.5 } }>
						{ hasSidebarPromotion &&
							<SideBarPromotion sideData={ props.homeScreenData.sidebar_promotion_variants } />
						}
					</Container>
				</Box>
			</Container>
		</Box>
	);
};

EditorScreen.propTypes = {
	homeScreenData: PropTypes.object,
	adminUrl: PropTypes.string,
};

export default EditorScreen;
