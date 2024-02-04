( () => {
	let styleguideRoot = null;
	const styleguideBodyClass = 'e-styleguide-shown';

	/**
	 * Add the app into the page.
	 */
	async function mount() {
		const { default: App } = await import( './frontend/app' );

		document.body.classList.add( styleguideBodyClass );

		styleguideRoot.render( <App /> );
	}

	/**
	 * Remove the app from the page.
	 */
	function unmount() {
		styleguideRoot.unmount();

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
	 * Create root if the container element is available.
	 */
	function createRoot() {
		const widget = getStyleguideWidget();

		if ( styleguideRoot || ! widget ) {
			return;
		}

		styleguideRoot = ReactDOM.createRoot( widget );
	}

	/**
	 * Listen to an event from the Styleguide e-component to mount or unmount the app.
	 */
	window.addEventListener( 'message', ( event ) => {
		if ( ! event.data?.name?.startsWith( 'elementor/styleguide/preview' ) || ! getStyleguideWidget() ) {
			return;
		}

		createRoot();

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
