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

					this.maybeSendQuotaCapacityEvent( data );

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
					this.promise = null;
				},
			} );
		} );

		return this.promise;
	}

	maybeSendQuotaCapacityEvent = ( data ) => {
		const value = data ? Math.round( ( data.currentUsage / data.threshold ) * 100 ) : 0;

		let quotaUsageAlert = null;

		if ( value < 80 ) {
			return;
		} else if ( 80 <= value < 100 ) {
			quotaUsageAlert = '80%';
		} else {
			quotaUsageAlert = '100%';
		}

		elementor.templates.eventManager.sendQuotaBarCapacityEvent( {
			quota_usage_alert: quotaUsageAlert,
		} );
	};

	defaultUtils() {
		return {
			setQuotaConfig: this.setQuotaConfig.bind( this ),
			getQuotaConfig: this.getQuotaConfig.bind( this ),
		};
	}
}
