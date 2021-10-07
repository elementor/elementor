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

		return args;
	}

	async run() {
		this.file = this.args.file;

		return await super.run();
	}
}
