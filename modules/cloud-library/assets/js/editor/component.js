import * as hooks from './hooks/';

export default class Component extends $e.modules.ComponentBase {
	promise = null;

	getNamespace() {
		return 'cloud-library';
	}

	getQuotaConfig() {
		if ( this.promise ) {
			return this.promise;
		}

		return Promise.resolve( elementorAppConfig[ 'cloud-library' ].quota );
	}

	setQuotaConfig() {
		this.promise = new Promise( ( resolve, reject ) => {
			elementorCommon.ajax.addRequest( 'get_templates_quota', {
				data: {
					source: 'cloud',
				},

				success: ( data ) => {
					elementorAppConfig[ 'cloud-library' ].quota = data;
					resolve( data );
					this.promise = null;
				},
				error: ( error ) => {
					delete elementorAppConfig[ 'cloud-library' ].quota;
					reject( error );
					this.promise = null;
				},
			} );
		} );

		return this.promise;
	}
	defaultHooks() {
		return this.importHooks( hooks );
	}

	defaultUtils() {
		return {
			setQuotaConfig: this.setQuotaConfig.bind( this ),
			getQuotaConfig: this.getQuotaConfig.bind( this ),
		};
	}
}
