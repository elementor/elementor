export class SetQuotaData extends $e.modules.hookUI.Before {
	getCommand() {
		return 'library/open';
	}

	getId() {
		return 'cloud-library-set-quota-data';
	}

	apply() {
        elementorCommon.ajax.addRequest( 'get_quota', {
			data: {
				source: 'cloud',
			},
			success: ( data ) => {
                elementorAppConfig['cloud-library'].quota = data;
			},
            error: () => {
                delete elementorAppConfig['cloud-library'].quota;
			},
		} );
	}
}
