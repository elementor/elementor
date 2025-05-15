export class SetQuotaData extends $e.modules.hookUI.Before {
	getCommand() {
		return 'editor/documents/attach-preview';
	}

	getId() {
		return 'cloud-library-set-quota-data';
	}

	getConditions() {
		return elementor.config.library_connect.is_connected && elementor.helpers.hasPro();
	}

	apply() {
		// $e.components.get( 'cloud-library' ).utils.setQuotaConfig();
	}
}
