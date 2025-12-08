import { Divider } from '@elementor/ui';
import ChevronRightIcon from '@elementor/icons/ChevronRightIcon';
import WebsiteIcon from '@elementor/icons/WebsiteIcon';
import PropTypes from 'prop-types';
import { SidebarCollapsedMenu } from './collapsed-menu';
import { CollapsedHeaderContainer } from './collapsed-menu/styled-components';
import { SidebarUpgradeCta } from './cta';
import { SidebarHeader } from './header';
import { SidebarMenu } from './menu';
import { CollapseButton, NavContainer, ScrollableContent, SiteIconBox } from './shared';
import { useSidebarCollapse } from './hooks/use-sidebar-collapse';

const SidebarNavigation = ( { config } ) => {
	const { isCollapsed, toggleCollapse } = useSidebarCollapse();

	if ( isCollapsed ) {
		return (
			<NavContainer component="nav">
				<CollapsedHeaderContainer>
					<SiteIconBox>
						<WebsiteIcon />
					</SiteIconBox>
					<CollapseButton onClick={ toggleCollapse } size="small">
						<ChevronRightIcon />
					</CollapseButton>
				</CollapsedHeaderContainer>
				<ScrollableContent>
					<SidebarCollapsedMenu
						menuItems={ config.menuItems }
						level4Groups={ config.level4Groups }
						activeMenuSlug={ config.activeMenuSlug }
						activeChildSlug={ config.activeChildSlug }
					/>
				</ScrollableContent>
			</NavContainer>
		);
	}

	return (
		<NavContainer component="nav">
			<SidebarHeader siteTitle={ config.siteTitle } onCollapse={ toggleCollapse } />
			<ScrollableContent>
				<SidebarMenu
					menuItems={ config.menuItems }
					level4Groups={ config.level4Groups }
					activeMenuSlug={ config.activeMenuSlug }
					activeChildSlug={ config.activeChildSlug }
				/>
			</ScrollableContent>
			<Divider />
			<SidebarUpgradeCta
				upgradeUrl={ config.upgradeUrl }
				upgradeText={ config.upgradeText }
				hasPro={ config.hasPro }
			/>
		</NavContainer>
	);
};

SidebarNavigation.propTypes = {
	config: PropTypes.object.isRequired,
};

export default SidebarNavigation;
