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
		console.log( path );
		return [
			{
				text: 'Home',
				type: 'home',
				isActive: '/dashboard' === path,
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
				isActive: 'add-new' === path,
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
				isActive: 'setup/general' === path,
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
				isActive: 'setup-features' === path,
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
				isActive: 'role-manager' === path,
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
				isActive: 'tools' === path,
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
				isActive: 'elementor-settings' === path,
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
				isActive: 'integrations' === path,
				url: '/dashboard/setup/integrations',
				display: {
					path: '/setup/integrations',
					type: 'iframe',
					src: 'admin.php?page=elementor&hide_wp=true#tab-integrations',
				},

			},
			{
				text: 'Custom Code',
				type: 'setup',
				isActive: 'custom-code' === path,
				url: '/dashboard/setup/custom-code',
				display: {
					path: '/setup/custom-code',
					type: 'iframe',
					src: 'edit.php?post_type=elementor_snippet&hide_wp=true',
				},

			},
			{
				text: 'Backups',
				type: 'setup',
				isActive: '' === path,
				url: 'https://my.elementor.com/',
				linkType: 'link',
			},
			{
				text: 'Theme Builder',
				type: 'design',
				isActive: 'theme-builder' === path,
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
				isActive: 'kit-library' === path,
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
				isActive: 'saved-templates' === path,
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
				isActive: 'kit-actions' === path,
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
				isActive: 'custom-fonts' === path,
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
				isActive: 'custom-icons' === path,
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
				isActive: 'popups' === path,
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
				isActive: 'landing-pages' === path,
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
				isActive: 'form-submissions' === path,
				url: '/dashboard/marketing/form-submissions',
				display: {
					path: '/marketing/form-submissions',
					type: 'iframe',
					src: 'admin.php?page=e-form-submissions&hide_wp=true',
				},
			},
		];
	}, [ location ] );
}

export default function Index() {
	usePageTitle( {
		title: __( 'Dashboard', 'elementor' ),
	} );

	const location = useLocation();
	const sideBarItems = useMenuItems( location.pathname );

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
