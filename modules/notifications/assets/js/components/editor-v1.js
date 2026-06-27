import { editorOnButtonClicked } from './editor-on-button-clicked';

export const editorV1 = () => {
	elementor.on( 'panel:init', () => {
		if ( elementorNotifications.unread_count > 0 ) {
			document.body.classList.add( 'e-has-notification' );
		}

		elementor.getPanelView().getPages( 'menu' ).view.addItem( {
			name: 'notification-center',
			icon: 'eicon-speakerphone',
			title: __( 'What\'s New', 'elementor' ),
			callback: editorOnButtonClicked,
		}, 'navigate_from_page', 'view-page' );
	} );
};
