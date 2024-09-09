import App from '../app/app';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import ReactDOM from 'react-dom/client';

const queryClient = new QueryClient();

export class TogglePopup extends $e.modules.CommandBase {
	static rootElement = null;
	static isOpen = false;

	apply( args ) {
		if ( ! TogglePopup.isOpen ) {
			this.mount();
		} else {
			this.unmount();
		}

		TogglePopup.isOpen = ! TogglePopup.isOpen;
		args.isOpen = TogglePopup.isOpen;
	}

	mount() {
		this.setRootElement();

		TogglePopup.rootElement.render( <QueryClientProvider client={ queryClient }>
			<App />
		</QueryClientProvider> );
	}

	unmount() {
		TogglePopup.rootElement.unmount();
		document.body.removeChild( document.body.querySelector( '#e-checklist' ) );
	}

	setRootElement() {
		let root = document.body.querySelector( '#e-checklist' );

		if ( ! root ) {
			root = document.createElement( 'div' );
			root.id = 'e-checklist';
			document.body.appendChild( root );
		}

		TogglePopup.rootElement = ReactDOM.createRoot( root );
	}
}

export default TogglePopup;
