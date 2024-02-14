import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { EditorV1 } from './components/editor-v1';

let isRendered = false;

const onButtonClicked = () => {
	if ( ! isRendered ) {
		isRendered = true;

		const container = document.createElement( 'div' );
		document.body.append( container );

		render( <EditorV1 />, container );

		return;
	}

	elementor.trigger( 'elementor/editor/panel/whats-new/clicked' );
};

// Support conditional rendering based on the React version.
// We use `createRoot` when available, but fallback to `ReactDOM.render` for older versions.
const render = ( app, domElement ) => {
	let renderFn;

	try {
		const root = createRoot( domElement );

		renderFn = () => {
			root.render( app );
		};
	} catch ( e ) {
		renderFn = () => {
			// eslint-disable-next-line react/no-deprecated
			ReactDOM.render( app, domElement );
		};
	}

	renderFn();
}

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
