import App from '../app';
import ReactDOM from 'react-dom/client';

export class Toggle extends $e.modules.CommandBase {
	static rootElement = null;
	static isOpen = false;

	apply() {
		if ( ! Toggle.isOpen ) {
			this.mount();
		} else {
			this.unmount();
		}

		Toggle.isOpen = ! Toggle.isOpen;
	}

	mount() {
		this.setRootElement();

		Toggle.rootElement.render( <App /> );
	}

	/**
	 * Remove the app from the page
	 */
	unmount() {
		Toggle.rootElement.unmount(); // eslint-disable-line react/no-deprecated
		document.body.removeChild( document.body.querySelector( '#e-checklist' ) );
	}

	setRootElement() {
		let root = document.body.querySelector( '#e-checklist' );

		if ( ! root ) {
			root = document.createElement( 'div' );
			root.id = 'e-checklist';
			document.body.appendChild( root );
		}

		Toggle.rootElement = ReactDOM.createRoot( root );
	}
}

export default Toggle;
