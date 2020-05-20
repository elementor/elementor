import CommandBase from 'elementor-api/modules/command-base';

export class Open extends CommandBase {
	apply() {
		const kit = elementor.documents.get( elementor.config.kit_id );

		if ( kit && 'open' === kit.editor.status ) {
			return jQuery.Deferred().resolve();
		}

		$e.routes.clearHistory( this.component.getRootContainer() );

		this.component.toggleHistoryClass();

		elementor.enterPreviewMode( true );

		return new Promise( ( resolve ) => {
			setTimeout( () => {
				elementor.exitPreviewMode();

				$e.internal( 'panel/state-loading' );

				$e.run( 'editor/documents/switch', {
					id: elementor.config.kit_id,
					mode: 'autosave',
				} ).finally( () => {
					resolve();

					$e.internal( 'panel/state-ready' );
				} );
			}, 500 );
		} );
	}
}

export default Open;
