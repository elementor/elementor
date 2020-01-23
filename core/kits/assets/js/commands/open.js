import CommandBase from 'elementor-api/modules/command-base';

export class Open extends CommandBase {
	apply( args ) {
		const kit = elementor.documents.get( elementor.config.kit_id );

		if ( kit && 'open' === kit.editor.status ) {
			$e.route( 'panel/global/style' );
			return jQuery.Deferred().resolve();
		}

		$e.routes.clearHistory( this.component.getRootContainer() );

		this.component.toggleHistoryClass();

		$e.internal( 'panel/state-loading' );

		return $e.run( 'editor/documents/switch', {
			id: elementor.config.kit_id,
		} ).then( () => {
			$e.internal( 'panel/state-ready' );
		} );
	}
}

export default Open;
