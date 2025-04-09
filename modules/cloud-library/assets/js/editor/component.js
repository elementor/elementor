import * as hooks from './hooks/';

export default class Component extends $e.modules.ComponentBase {
	promise = null;

	request = null;

	getNamespace() {
		return 'cloud-library';
	}

	cancelPendingRequest() {
		if ( this.request ) {
			elementorCommon.ajax.cancelRequest( 'get_templates_quota' );
		}

		this.promise = null;
		this.request = null;
	}

	getQuotaConfig( force = false ) {
		if ( force ) {
			this.cancelPendingRequest();
			return this.setQuotaConfig();
		}

		if ( this.promise && ! force ) {
			return this.promise;
		}

		return Promise.resolve( elementorAppConfig[ 'cloud-library' ].quota );
	}

	setQuotaConfig( force = false ) {
		if ( force ) {
			this.cancelPendingRequest();
		}

		this.promise = new Promise( ( resolve, reject ) => {
			this.request = elementorCommon.ajax.addRequest( 'get_templates_quota', {
				data: {
					source: 'cloud',
				},

				success: ( data ) => {
					elementorAppConfig[ 'cloud-library' ].quota = data;
					resolve( data );
					this.promise = null;
					this.request = null;
					elementor.channels.templates.trigger( 'quota:updated', data );
				},

				error: ( error ) => {
					if ( error?.statusText !== 'abort' ) {
						delete elementorAppConfig[ 'cloud-library' ].quota;
					}

					reject( error );
					this.request = null;
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
