import * as hooks from './hooks/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'cloud-library';
	}

	setQuotaConfig() {
		return new Promise( ( resolve, reject ) => {
			elementorCommon.ajax.addRequest( 'get_quota', {
				data: {
					source: 'cloud',
				},
				success: ( data ) => {
					const fakeQuota = {
						threshold: 1500,
						currentUsage: Math.floor(Math.random() * 501) + 1000,
					}
					elementorAppConfig[ 'cloud-library' ].quota = fakeQuota;
					resolve( fakeQuota );
				},
				error: ( error ) => {
					delete elementorAppConfig[ 'cloud-library' ].quota;
					reject( error );
				},
			} );
		} );
	}
	defaultHooks() {
		return this.importHooks( hooks );
	}

	defaultUtils() {
		return {
			setQuotaConfig: this.setQuotaConfig.bind( this ),
		};
	}
}
