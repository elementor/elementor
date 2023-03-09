( () => {
	/**
	 * Add the app into the page.
	 */
	async function mount() {
		const appRootElement = document.querySelector( '.elementor-global-styleguide-widget' );

		if ( ! appRootElement ) {
			return;
		}

		const { default: App } = await import( './frontend/app' );

		ReactDOM.render( <App />, appRootElement );
	}

	/**
	 * Remove the app from the page
	 */
	function unmount() {
		const appRootElement = document.querySelector( '.elementor-global-styleguide-widget' );

		if ( ! appRootElement ) {
			return;
		}

		ReactDOM.unmountComponentAtNode( appRootElement );
	}

	// Listen to an event from the notes e-component to mount or unmount the app.
	window.addEventListener( 'message', ( event ) => {
		if ( ! event.data?.name?.startsWith( 'elementor/styleguide/preview' ) ) {
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
