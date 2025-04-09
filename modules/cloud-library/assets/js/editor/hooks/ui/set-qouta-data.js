export class SetQuotaData extends $e.modules.hookUI.Before {
	getCommand() {
		return 'editor/documents/attach-preview';
	}

	getId() {
		return 'cloud-library-set-quota-data';
	}

	getCondition() {
		elementor.helpers.hasPro();
	}

	apply() {
		$e.components.get( 'cloud-library' ).utils.setQuotaConfig();
	}
}
