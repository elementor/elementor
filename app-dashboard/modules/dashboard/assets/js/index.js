import Layout from './components/layout';
import ItemsFilter from './components/items-filter';
import usePageTitle from 'elementor-app/hooks/use-page-title';

import './index.scss';
import Header from './components/layout/header';
import {useMemo} from 'react';
import {Router, useLocation} from '@reach/router';
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

		// const page =hashString = window.location.hash.substring(1)

		return [
			{
				text: 'Home',
				type: 'home',
				isActive: '/dashboard' === page,
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
				display: {
					path: '/setup/general',
					type: 'image',
					src: 'Site Settings.png',
				},
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
			{
				text: 'Theme Builder',
				type: 'design',
				isActive: 'theme-builder' === page,
				url: '/dashboard/design/theme-builder',
				display: {
					path: '/design/theme-builder',
					type: 'iframe',
					src: 'admin.php?page=elementor-app&ver=3.10.2&hide_wp=true#site-editor',
				},

			},
			{
				text: 'Kit Library',
				type: 'design',
				isActive: 'kit-library' === page,
				url: '/dashboard/design/kit-library',
				display: {
					path: '/design/kit-library',
					type: 'iframe',
					src: 'admin.php?page=elementor-app&ver=3.10.2&hide_wp=true#kit-library',
				},

			},
			{
				text: 'Saved Templates',
				type: 'design',
				isActive: 'saved-templates' === page,
				url: '/dashboard/design/saved-templates',
				display: {
					path: '/design/saved-templates',
					type: 'iframe',
					src: 'edit.php?post_type=elementor_library&hide_wp=true&tabs_group=library',
				},
			},
			{
				text: 'Kit Actions',
				type: 'design',
				isActive: 'kit-actions' === page,
				url: '/dashboard/design/kit-actions',
				display: {
					path: '/design/kit-actions',
					type: 'iframe',
					src: 'admin.php?page=elementor-tools&hide_wp=true#tab-import-export-kit',
				},
			},
			{
				text: 'Custom Fonts',
				type: 'design',
				isActive: 'custom-fonts' === page,
				url: '/dashboard/design/custom-fonts',
				display: {
					path: '/design/custom-fonts',
					type: 'iframe',
					src: 'edit.php?post_type=elementor_font&hide_wp=true',
				},
			},
			{
				text: 'Custom Icons',
				type: 'design',
				isActive: 'custom-icons' === page,
				url: '/dashboard/design/custom-icons',
				display: {
					path: '/design/custom-icons',
					type: 'iframe',
					src: 'edit.php?post_type=elementor_icons&hide_wp=true',
				},
			},
			{
				text: 'Popups',
				type: 'marketing',
				isActive: 'popups' === page,
				url: '/dashboard/marketing/popups',
				display: {
					path: '/marketing/popups',
					type: 'iframe',
					src: 'edit.php?post_type=elementor_library&tabs_group=popup&elementor_library_type=popup&hide_wp=true',
				},
			},
			{
				text: 'Landing Pages',
				type: 'marketing',
				isActive: 'landing-pages' === page,
				url: '/dashboard/marketing/landing-pages',
				display: {
					path: '/marketing/landing-pages',
					type: 'iframe',
					src: 'edit.php?post_type=elementor_library&page=e-landing-page&hide_wp=true',
				},
			},
			{
				text: 'Form submissions',
				type: 'marketing',
				isActive: 'form-submissions' === page,
				url: '/dashboard/marketing/form-submissions',
				display: {
					path: '/marketing/form-submissions',
					type: 'iframe',
					src: 'admin.php?page=e-form-submissions&hide_wp=true',
				},
			},
			{
				text: 'Marketing Integrations',
				type: 'marketing',
				isActive: 'marketing-integration' === page,
				url: '/dashboard/marketing/marketing-integration',
				display: {
					path: '/marketing/marketing-integration',
					type: 'image',
					src: 'integrations.png',
				},
			},
			{
				text: 'Custom Code',
				type: 'setup',
				isActive: 'custom-code' === page,
				url: '/dashboard/setup/custom-code',
				display: {
					path: '/setup/custom-code',
					type: 'iframe',
					src: 'edit.php?post_type=elementor_snippet&hide_wp=true',
				},

			},
		];
	}, [ path ] );
}

export default function Index() {
	usePageTitle( {
		title: __( 'Dashboard', 'elementor' ),
	} );

	const location = useLocation();

	history.listen((location, action) => {
		console.log(`The current URL is ${location.pathname}${location.search}${location.hash}`)
		console.log(`The last navigation action was ${action}`)
	})

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
								key={ item.text }
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
