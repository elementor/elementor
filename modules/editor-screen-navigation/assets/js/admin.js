import ReactUtils from 'elementor-utils/react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';
import NavigationSidebar from './navigation-sidebar';

const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;
const navigationSidebarElement = document.getElementById( 'e-navigation-sidebar-root' );
const isRTL = elementorCommon.config.isRTL;

if ( navigationSidebarElement ) {
	ReactUtils.render( (
		<AppWrapper>
			<DirectionProvider rtl={ isRTL }>
				<LocalizationProvider>
					<ThemeProvider colorScheme="light">
						<NavigationSidebar />
					</ThemeProvider>
				</LocalizationProvider>
			</DirectionProvider>
		</AppWrapper>
	), navigationSidebarElement );
}

if ( document.body.classList.contains( 'e-one-editor-page' ) ) {
	const editorMenuItem = document.querySelector( '#toplevel_page_elementor .wp-submenu a[href="admin.php?page=editor_screen"]' );
	if ( editorMenuItem ) {
		editorMenuItem.classList.add( 'current' );
		editorMenuItem.parentElement?.classList.add( 'current' );
	}
}
