import { restoreSdkSidebar, toggleSdkSidebar } from './scanner/open-angie';

const ADMIN_BAR_ANGIE_TOGGLE_SELECTOR = '#wp-admin-bar-elementor-angie-toggle > .ab-item';

const logAngieError = ( error ) => {
	// eslint-disable-next-line no-console
	console.error( 'Toggling Angie failed:', error );
};

const bindAdminBarAngieToggle = () => {
	const toggle = document.querySelector( ADMIN_BAR_ANGIE_TOGGLE_SELECTOR );

	if ( ! toggle ) {
		return;
	}

	toggle.addEventListener( 'click', ( event ) => {
		event.preventDefault();

		toggleSdkSidebar().catch( logAngieError );
	} );

	restoreSdkSidebar().catch( logAngieError );
};

bindAdminBarAngieToggle();
