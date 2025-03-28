export class SetQuotaData extends $e.modules.hookUI.Before {
	getCommand() {
		return 'library/open';
	}

	getId() {
		return 'cloud-library-set-quota-data';
	}

	apply() {
		elementorCommon.ajax.addRequest( 'get_quota', {
            data: { source: 'cloud' },
            success: ( response ) => {
                console.log( response );
            },
            error: ( error ) => {
                console.log( error );
            }
        } );
	}
}

export default SetQuotaData;
