import CommandBase from 'elementor-api/modules/command-base';

export class Close extends CommandBase {
	apply( args ) {
		const { mode } = args;

		// The kit is opened directly.
		if ( elementor.config.initial_document.id === parseInt( elementor.config.kit_id ) ) {
			return $e.run( 'panel/global/exit' );
		}

		$e.internal( 'panel/state-loading' );

		return $e.run( 'editor/documents/switch', {
			mode,
			id: elementor.config.initial_document.id,
			onClose: ( document ) => {
				if ( document.isDraft() ) {
					// Restore published style.
					elementor.toggleDocumentCssFiles( document, true );
					elementor.settings.page.destroyControlsCSS();
				}

				$e.components.get( 'panel/global' ).close();
				$e.routes.clearHistory( this.component.getRootContainer() );

				// The kit shouldn't be cached for next open. (it may be changed via create colors/typography).
				elementor.documents.invalidateCache( elementor.config.kit_id );
			},
		} ).finally( () => $e.internal( 'panel/state-ready' ) );
	}
}

export default Close;
