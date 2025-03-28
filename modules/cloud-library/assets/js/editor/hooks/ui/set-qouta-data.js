export class SetQuotaData extends $e.modules.hookUI.Before {
	getCommand() {
		return 'library/open';
	}

	getId() {
		return 'cloud-library-set-quota-data';
	}

    getConditions() {
		return undefined === elementorAppConfig[ 'cloud-library' ].quota;
	}

	apply() {
        elementorCommon.ajax.addRequest( 'get_quota', {
            data: { source: 'cloud' },
            success: ( response ) => {
                elementorAppConfig['cloud-library'].quota = response;
            },
            error: () => {
                delete elementorAppConfig['cloud-library'].quota;
            },
        } );
    }
}

export default SetQuotaData;
