( () => {
	let styleguideWidget;

	/**
	 * Add the app into the page.
	 */
	async function mount() {
		const { default: App } = await import( './frontend/app' );

		ReactDOM.render( <App />, styleguideWidget );
	}

	/**
	 * Remove the app from the page.
	 */
	function unmount() {
		ReactDOM.unmountComponentAtNode( styleguideWidget );
	}

	/**
	 * Get the Styleguide widget that serves as the App container.
	 * Returns null if the widget does not exist.
	 *
	 * @return {Object|null}
	 */
	function getStyleguideWidget() {
		styleguideWidget = document.querySelector( '.elementor-global-styleguide-widget' );

		return styleguideWidget;
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
				window.top.elementor.changeEditMode( 'picker' );
				mount();
				break;

			case 'elementor/styleguide/preview/hide':
				window.top.elementor.changeEditMode( 'edit' );
				unmount();
				break;
		}
	} );
} )();
