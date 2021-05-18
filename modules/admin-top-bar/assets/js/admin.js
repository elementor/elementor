import AdminTopBar from './app';

const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;

const menuItemClasString = elementorAdminTopBarConfig.elementor_menu_item_ids
	.map( ( elementorMenuItemId ) => `#${ elementorMenuItemId } .wp-menu-open` )
	.join( ', ' );

if ( document.querySelector( menuItemClasString ) ) {
	ReactDOM.render(
		<AppWrapper>
			<AdminTopBar />
		</AppWrapper>,
		document.getElementById( 'e-admin-top-bar' )
	);
}

