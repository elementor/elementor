export class SetQuotaData extends $e.modules.hookUI.Before {
	getCommand() {
		return 'library/open';
	}

	getId() {
		return 'cloud-library-set-quota-data';
	}

	apply() {
		$e.components.get( 'cloud-library' ).utils.setQuotaConfig();
	}
}
