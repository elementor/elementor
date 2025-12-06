import { useCallback, useEffect, useState } from '@wordpress/element';
import { Box, Divider, IconButton } from '@elementor/ui';
import ChevronRightIcon from '@elementor/icons/ChevronRightIcon';
import WebsiteIcon from '@elementor/icons/WebsiteIcon';
import PropTypes from 'prop-types';
import SidebarCollapsedMenu from './sidebar-collapsed-menu';
import SidebarHeader from './sidebar-header';
import SidebarMenu from './sidebar-menu';
import SidebarUpgradeCta from './sidebar-upgrade-cta';

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
			<Box
				component="nav"
				sx={ {
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					backgroundColor: 'background.paper',
					borderRight: 1,
					borderColor: 'divider',
				} }
			>
				<Box
					sx={ {
						position: 'relative',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: 80,
						borderBottom: 1,
						borderColor: 'divider',
					} }
				>
					<Box
						sx={ {
							width: 40,
							height: 40,
							borderRadius: 1,
							border: 1,
							borderColor: 'divider',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: 'background.paper',
						} }
					>
						<WebsiteIcon sx={ { fontSize: 24 } } />
					</Box>
					<IconButton
						size="small"
						onClick={ handleToggle }
						sx={ {
							position: 'absolute',
							right: -12,
							bottom: -12,
							width: 24,
							height: 24,
							backgroundColor: 'background.paper',
							border: 1,
							borderColor: 'divider',
							color: 'text.secondary',
							zIndex: 1,
							'&:hover': {
								backgroundColor: 'action.hover',
							},
						} }
					>
						<ChevronRightIcon sx={ { fontSize: 16 } } />
					</IconButton>
				</Box>
				<Box sx={ { flex: 1, overflowY: 'auto', overflowX: 'hidden' } }>
					<SidebarCollapsedMenu
						menuItems={ config.menuItems }
						level4Groups={ config.level4Groups }
						activeMenuSlug={ config.activeMenuSlug }
						activeChildSlug={ config.activeChildSlug }
					/>
				</Box>
			</Box>
		);
	}

	return (
		<Box
			component="nav"
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				backgroundColor: 'background.paper',
				borderRight: 1,
				borderColor: 'divider',
			} }
		>
			<SidebarHeader siteTitle={ config.siteTitle } onCollapse={ handleToggle } />
			<Box sx={ { flex: 1, overflowY: 'auto', overflowX: 'hidden' } }>
				<SidebarMenu
					menuItems={ config.menuItems }
					level4Groups={ config.level4Groups }
					activeMenuSlug={ config.activeMenuSlug }
					activeChildSlug={ config.activeChildSlug }
				/>
			</Box>
			<Divider />
			<SidebarUpgradeCta upgradeUrl={ config.upgradeUrl } upgradeText={ config.upgradeText } hasPro={ config.hasPro } />
		</Box>
	);
};

SidebarNavigation.propTypes = {
	config: PropTypes.object.isRequired,
};

export default SidebarNavigation;

