import CommandData from 'elementor-api/modules/command-data';

export class Media extends CommandData {
	static getEndpointFormat() {
		// 'wp/media' to 'media' since `requestData.namespace` is 'wp'.
		return 'media';
	}

	validateArgs( args = {} ) {
		this.requireArgumentInstance( 'file', File );
	}

	getRequestData() {
		const requestData = super.getRequestData();

		requestData.namespace = 'wp';
		requestData.version = '2';

		return requestData;
	}

	applyBeforeCreate( args ) {
		args.headers = {
			'Content-Disposition': `attachment; filename=${ this.file.name }`,
			'Content-Type': this.file.type,
		};

		args.data = this.file;

		if ( args.options?.progress ) {
			this.toast = elementor.notifications.showToast( {
				message: __( 'Uploading...' ),
				sticky: true,
			} );
		}

		return args;
	}

	applyAfterCreate( data, args ) {
		if ( args.options?.progress ) {
			this.toast.hide();
		}

		return data;
	}

	async run() {
		this.file = this.args.file;

		if ( this.file.size > parseInt( window._wpPluploadSettings.defaults.filters.max_file_size, 10 ) ) {
			throw new Error( 'The file exceeds the maximum upload size for this site.' );
		}

		return await super.run();
	}
}
