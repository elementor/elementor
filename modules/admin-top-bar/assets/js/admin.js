import AdminTopBar from './app';

const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;

const elementorMenuItemIds = [
	'toplevel_page_elementor',
	'menu-posts-elementor_library',

];

const menuItemSelector = elementorMenuItemIds
	.map( ( itemId ) => `#${ itemId } .wp-menu-open` )
	.join( ', ' );

if ( document.querySelector( menuItemSelector ) ) {
	ReactDOM.render(
		<AppWrapper>
			<AdminTopBar />
		</AppWrapper>,
		document.getElementById( 'e-admin-top-bar' )
	);
}

