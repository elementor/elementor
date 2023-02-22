import CommandData from 'elementor-api/modules/command-data';
import FilesUploadHandler from 'elementor-editor/utils/files-upload-handler';

export class Media extends CommandData {
	static getEndpointFormat() {
		// 'wp/media' to 'media' since `requestData.namespace` is 'wp'.
		return 'media';
	}

	validateArgs() {
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

		args.query = {
			uploadTypeCaller: 'elementor-wp-media-upload',
		};

		args.data = this.file;

		if ( args.options?.progress ) {
			this.toast = elementor.notifications.showToast( {
				// eslint-disable-next-line @wordpress/i18n-ellipsis
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
			throw new Error( __( 'The file exceeds the maximum upload size for this site.', 'elementor' ) );
		}

		if (
			! window._wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions.split( ',' ).includes(
				this.file.name.split( '.' ).pop(),
			) &&
			! elementor.config.filesUpload.unfilteredFiles
		) {
			FilesUploadHandler.getUnfilteredFilesNotEnabledDialog( () => {} ).show();
			return;
		}

		return await super.run();
	}
}
