export class Open extends $e.modules.CommandBase {
	static getInfo() {
		return {
			isSafe: true,
		};
	}

	apply() {
		const kit = elementor.documents.get( elementor.config.kit_id );

		if ( kit && 'open' === kit.editor.status ) {
			return jQuery.Deferred().resolve();
		}

		$e.routes.clearHistory( this.component.getServiceName() );

		this.component.toggleHistoryClass();

		$e.internal( 'panel/state-loading' );

		return $e.run( 'editor/documents/switch', {
			id: elementor.config.kit_id,
			mode: 'autosave',
		} ).finally( () => $e.internal( 'panel/state-ready' ) );
	}
}

export default Open;
