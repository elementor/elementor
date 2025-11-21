import { Box, List } from '@elementor/ui';
import NavItem from './components/nav-item';
import { useEffect } from 'react';

export default function NavigationSidebar( { config = {} } ) {
	const finalConfig = config.menuItems ? config : ( window.elementorEditorScreenNavigationConfig || {} );
	const menuItems = finalConfig.menuItems || [];
	const currentPage = finalConfig.currentPage || '';

	useEffect( () => {
		const navigationElement = document.querySelector( '#e-navigation-sidebar-root' );
		if ( navigationElement ) {
			navigationElement.classList.add( 'e-navigation-sidebar--active' );
		}
	}, [] );

	return (
		<Box
			sx={ {
				position: 'absolute',
				left: '160px',
				top: '50px',
				height: '100%',
				width: '200px',
				backgroundColor: 'background.paper',
				borderRight: '1px solid',
				borderColor: 'divider',
				zIndex: 9990,
				display: 'flex',
				flexDirection: 'column',
				overflowY: 'auto',
			} }
		>
			<List sx={ { py: 1 } }>
				{
					menuItems.map( ( item ) => {
						const isActive = item.page ? currentPage.includes( item.page ) : false;
						return (
							<NavItem
								key={ item.id }
								item={ item }
								isActive={ isActive }
							/>
						);
					} )
				}
			</List>
		</Box>
	);
}

