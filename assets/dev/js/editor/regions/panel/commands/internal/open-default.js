export class OpenDefault extends $e.modules.CommandInternalBase {
	apply( args = {} ) {
		$e.route( elementor.documents.getCurrent().config.panel.default_route, args );

		if ( ! this.component.stateReadyOnce ) {
			this.component.stateReadyOnce = true;

			$e.extras.hashCommands.runOnce();
		}

		return Promise.resolve();
	}
}

export default OpenDefault;
