import Layout from './components/layout';
import ItemsFilter from './components/items-filter';
import usePageTitle from 'elementor-app/hooks/use-page-title';

import './index.scss';
import Header from './components/layout/header';
import {useMemo} from 'react';
import {Router} from '@reach/router';
import DisplayContent from './pages/display-content';

/**
 * Generate the menu items for the index page.
 *
 * @param {string} path
 * @return {Array} menu items
 */
function useMenuItems( path ) {
	return useMemo( () => {
		const page = path.replace( '/', '' );

		return [
			{
				text: 'Home',
				type: 'home',
				isActive: ! page,
				url: '/dashboard',
				display: {
					path: '/',
					type: 'image',
					src: 'dashboard.png',
				},
			},
			{
				text: 'Add New',
				type: 'home',
				isActive: 'add-new' === page,
				url: '/dashboard/add-new',
				display: {
					path: '/add-new',
					type: 'image',
					src: 'addnew.png',
				},
			},
			{
				text: 'General',
				type: 'setup',
				isActive: 'setup/general' === page,
				url: '/dashboard/setup/general',
			},
			{
				text: 'Features',
				type: 'setup',
				isActive: 'setup-features' === page,
				url: '/dashboard/setup/features',
				display: {
					path: '/setup/features',
					type: 'iframe',
					src: 'admin.php?page=elementor&hide_wp=true#tab-experiments',
				},

			},
			{
				text: 'Role Manager',
				type: 'setup',
				isActive: 'role-manager' === page,
				url: '/dashboard/setup/role-manager',
				display: {
					path: '/setup/role-manager',
					type: 'iframe',
					src: 'admin.php?page=elementor-role-manager&hide_wp=true',
				},

			},
			{
				text: 'Tools',
				type: 'setup',
				isActive: 'tools' === page,
				url: '/dashboard/setup/tools',
				display: {
					path: '/setup/tools',
					type: 'iframe',
					src: 'admin.php?page=elementor-tools&hide_wp=true#tab-general',
				},

			},
			{
				text: 'Elementor Settings',
				type: 'setup',
				isActive: 'elementor-settings' === page,
				url: '/dashboard/setup/elementor-settings',
				display: {
					path: '/setup/elementor-settings',
					type: 'image',
					src: 'Elementor Settings.png',
				},

			},
			{
				text: 'Integrations',
				type: 'setup',
				isActive: 'integrations' === page,
				url: '/dashboard/setup/integrations',
				display: {
					path: '/setup/integrations',
					type: 'iframe',
					src: 'admin.php?page=elementor&hide_wp=true#tab-integrations',
				},

			},
			{
				text: 'Backups',
				type: 'setup',
				isActive: '' === page,
				url: 'https://go.elementor.com/app-kit-library-how-to-use-kits/',
				linkType: 'link',
			},
		];
	}, [ path ] );
}

export default function Index() {
	usePageTitle( {
		title: __( 'Dashboard', 'elementor' ),
	} );

	const sideBarItems = useMenuItems( '/' );

	return (
		<Layout
			header={
				<Header />
			}
			sidebar={
				<ItemsFilter items={ sideBarItems }	/>
			}
		>
			<div className="e-dashboard__container">
				<Router>
					{
						sideBarItems.map( ( item ) => (
							item.display &&
							<DisplayContent
								path={ item.display.path }
								type={ item.display.type }
								src={ item.display.src }
							/>
						) )
					}
				</Router>
			</div>
		</Layout>
	);
}

Index.propTypes = {
	path: PropTypes.string,
	initialQueryParams: PropTypes.object,
	renderNoResultsComponent: PropTypes.func,
};

Index.defaultProps = {
	initialQueryParams: {},
	renderNoResultsComponent: ( { defaultComponent } ) => defaultComponent,
};
