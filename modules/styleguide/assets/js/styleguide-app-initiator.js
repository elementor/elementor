import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

( () => {
	let styleguideRoot = null;
	const styleguideBodyClass = 'e-styleguide-shown';

	/**
	 * Add the app into the page.
	 */
	async function mount() {
		const { default: App } = await import( './frontend/app' );

		document.body.classList.add( styleguideBodyClass );

		render( <App />, getStyleguideWidget() );
	}

	// Support conditional rendering based on the React version.
	// We use `createRoot` when available, but fallback to `ReactDOM.render` for older versions.
	function render( app, domElement ) {
		let renderFn;

		try {
			if ( ! styleguideRoot ) {
				styleguideRoot = createRoot( domElement );
			}

			renderFn = () => {
				styleguideRoot.render( app );
			};
		} catch ( e ) {
			renderFn = () => {
				// eslint-disable-next-line react/no-deprecated
				ReactDOM.render( app, domElement );
			};
		}

		renderFn();
	}

	/**
	 * Remove the app from the page.
	 */
	function unmount() {
		try {
			styleguideRoot.unmount();
		} catch ( e ) {
			// eslint-disable-next-line react/no-deprecated
			ReactDOM.unmountComponentAtNode( getStyleguideWidget() );
		}

		styleguideRoot = null;

		document.body.classList.remove( styleguideBodyClass );
	}

	/**
	 * Get the Styleguide widget that serves as the App container.
	 * Returns null if the widget does not exist.
	 *
	 * @return {Object|null}
	 */
	function getStyleguideWidget() {
		return document.querySelector( '.dialog-styleguide-message' );
	}

	/**
	 * Listen to an event from the Styleguide e-component to mount or unmount the app.
	 */
	window.addEventListener( 'message', ( event ) => {
		if ( ! event.data?.name?.startsWith( 'elementor/styleguide/preview' ) || ! getStyleguideWidget() ) {
			return;
		}

		switch ( event.data.name ) {
			case 'elementor/styleguide/preview/show':
				mount();
				break;

			case 'elementor/styleguide/preview/hide':
				unmount();
				break;
		}
	} );
} )();
