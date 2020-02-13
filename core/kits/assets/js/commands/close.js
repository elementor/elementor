import CommandBase from 'elementor-api/modules/command-base';

export class Close extends CommandBase {
	apply() {
		// The kit is opened directly.
		if ( elementor.config.initial_document.id === parseInt( elementor.config.kit_id ) ) {
			return $e.run( 'panel/global/exit' );
		}

		$e.internal( 'panel/state-loading' );

		elementor.enterPreviewMode( true );

		return new Promise( ( resolve ) => {
			setTimeout( () => {
				return $e.run( 'editor/documents/switch', {
					id: elementor.config.initial_document.id,
					onClose: ( document ) => {
						if ( document.isDraft() ) {
							// Restore published style.
							elementor.toggleDocumentCssFiles( document, true );
							elementor.settings.page.destroyControlsCSS();
						}

						$e.components.get( 'panel/global' ).close();
						$e.routes.clearHistory( this.component.getRootContainer() );
					},
				} )
				.finally( () => {
					resolve();

					$e.internal( 'panel/state-ready' );
				} )
				.catch( () => {
					elementor.exitPreviewMode();
				} );
			}, 500 );
		} );
	}
}

export default Close;
