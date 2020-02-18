import CommandBase from 'elementor-api/modules/command-base';

export class Exit extends CommandBase {
	apply() {
		return $e.run( 'editor/documents/close', {
			id: elementor.config.kit_id,
			onClose: ( document ) => {
				location = document.config.urls.exit_to_dashboard;
			},
		} );
	}
}

export default Exit;
