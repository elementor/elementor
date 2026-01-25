import { Divider } from '@elementor/ui';
import ChevronRightIcon from '@elementor/icons/ChevronRightIcon';
import EditorIcon from './icons/editor';
import PropTypes from 'prop-types';
import { SidebarCollapsedMenu } from './collapsed-menu';
import { SidebarUpgradeCta } from './cta';
import { SidebarHeader } from './header';
import { SidebarMenu } from './menu';
import { CollapseButton, NavContainer, ScrollableContent, SiteIconBox, CollapsedHeaderContainer } from './shared';
import { useSidebarCollapse } from './hooks/use-sidebar-collapse';
import { useAdminMenuOffset } from './hooks/use-admin-menu-offset';

const SidebarNavigation = ( { config } ) => {
	const { isCollapsed, toggleCollapse } = useSidebarCollapse();
	useAdminMenuOffset();

	if ( isCollapsed ) {
		return (
			<NavContainer component="nav" collapsed>
				<CollapsedHeaderContainer>
					<SiteIconBox>
						<EditorIcon />
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
				<Divider />
				<SidebarUpgradeCta
					upgradeUrl={ config.upgradeUrl }
					upgradeText={ config.upgradeText }
					hasPro={ config.hasPro }
					collapsed
				/>
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
