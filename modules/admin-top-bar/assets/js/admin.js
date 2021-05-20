import AdminTopBar from './app';

const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;

const menuItemSelector = elementorAdminTopBarConfig.elementor_menu_item_ids
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

