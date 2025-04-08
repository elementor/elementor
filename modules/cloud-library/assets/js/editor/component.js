import * as hooks from './hooks/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'cloud-library';
	}

	setQuotaConfig() {
		return new Promise( ( resolve, reject ) => {
			elementorCommon.ajax.addRequest( 'get_templates_quota', {
				data: {
					source: 'cloud',
				},

				success: ( data ) => {
					elementorAppConfig[ 'cloud-library' ].quota = data;
					resolve( data );
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
