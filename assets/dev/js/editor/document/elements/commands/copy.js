export class Copy extends $e.modules.editor.CommandContainerBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { storageKey = 'clipboard', containers = [ args.container ] } = args;

		if ( ! elementor.selection.isSameType() ) {
			elementor.notifications.showToast( {
				message: __( 'That didn’t work. Try copying one kind of element at a time.', 'elementor' ),
				buttons: [
					{
						name: 'got_it',
						text: __( 'Got it', 'elementor' ),
					},
				],
			} );

			return false;
		}

		const elements = elementor.getPreviewView().$el.find( '.elementor-element' );

		const elementsData = containers.sort( ( first, second ) => {
			return elements.index( first.view.el ) - elements.index( second.view.el );
		} ).map( ( container ) => container.model.toJSON( { copyHtmlCache: true } ) );

		const storageData = {
			type: 'elementor',
			siteurl: elementorCommon.config.urls.rest,
			elements: elementsData,
		};

		elementorCommon.storage.set(
			storageKey,
			storageData,
		);

		// TODO: Use package for clipboard saving
		const clipboard = document.createElement( 'textarea' );
		clipboard.value = JSON.stringify( storageData );
		document.body.appendChild( clipboard );
		clipboard.select();
		document.execCommand( 'copy' );
		document.body.removeChild( clipboard );
	}
}

export default Copy;
