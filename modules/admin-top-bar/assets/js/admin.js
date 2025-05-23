import AdminTopBar from './admin-top-bar';

const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;
const adminTopBarElement = document.getElementById( 'e-admin-top-bar-root' );

const elementorMenuItemIds = [
	'toplevel_page_elementor',
	'menu-posts-elementor_library',
];

const menuItemSelector = elementorMenuItemIds
	.map( ( itemId ) => `#${ itemId } .wp-menu-open` )
	.join( ', ' );

const isElementorPage = !! document.querySelector( menuItemSelector );

if ( isElementorPage ) {
	ReactDOM.render(
		<AppWrapper>
			<AdminTopBar />
		</AppWrapper>,
		adminTopBarElement,
	);
}
