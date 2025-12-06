import { useCallback, useEffect, useState } from '@wordpress/element';
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

const STORAGE_KEY = 'elementor_sidebar_collapsed';

const SidebarNavigation = ( { config } ) => {
	const [ isCollapsed, setIsCollapsed ] = useState( () => {
		return 'true' === localStorage.getItem( STORAGE_KEY );
	} );

	const handleToggle = useCallback( () => {
		const newState = ! isCollapsed;
		setIsCollapsed( newState );
		localStorage.setItem( STORAGE_KEY, String( newState ) );
	}, [ isCollapsed ] );

	useEffect( () => {
		const container = document.getElementById( 'e-editor-sidebar-navigation' );
		const body = document.body;

		if ( isCollapsed ) {
			container?.classList.add( 'e-sidebar-collapsed' );
			body.classList.add( 'e-sidebar-is-collapsed' );
		} else {
			container?.classList.remove( 'e-sidebar-collapsed' );
			body.classList.remove( 'e-sidebar-is-collapsed' );
		}
	}, [ isCollapsed ] );

	if ( isCollapsed ) {
		return (
			<NavContainer>
				<CollapsedHeaderContainer>
					<SiteIconBox>
						<WebsiteIcon sx={ { fontSize: 24 } } />
					</SiteIconBox>
					<CollapseButton onClick={ handleToggle }>
						<ChevronRightIcon sx={ { fontSize: 16 } } />
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
		<NavContainer>
			<SidebarHeader siteTitle={ config.siteTitle } onCollapse={ handleToggle } />
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

