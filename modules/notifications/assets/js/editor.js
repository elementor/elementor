import { EditorV1 } from './components/editor-v1';

let isRendered = false;

const onButtonClicked = () => {
	if ( ! isRendered ) {
		isRendered = true;

		const container = document.createElement( 'div' );

		document.body.append( container );

		ReactDOM.render(
			<EditorV1 />,
			container,
		);

		return;
	}

	elementor.trigger( 'elementor/editor/panel/whats-new/clicked' );
};

elementor.on( 'panel:init', () => {
	if ( elementorNotifications.is_unread ) {
		document.body.classList.add( 'e-has-notification' );
	}

	elementor.getPanelView().getPages( 'menu' ).view.addItem( {
		name: 'notification-center',
		icon: 'eicon-notification',
		title: __( 'What\'s New', 'elementor' ),
		callback: onButtonClicked,
	}, 'navigate_from_page', 'view-page' );
} );
