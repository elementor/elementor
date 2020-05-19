export default class FilesUploadHandler {
	static isUploadEnabled( mediaType ) {
		const unfilteredFilesTypes = [ 'svg', 'application/json' ];

		if ( ! unfilteredFilesTypes.includes( mediaType ) ) {
			return true;
		}

		return elementor.config.filesUpload.unfilteredFiles;
	}

	static setUploadTypeCaller( frame ) {
		frame.uploader.uploader.param( 'uploadTypeCaller', 'elementor-editor-upload' );
	}

	static getUnfilteredFilesNotEnabledDialog( callback ) {
		const onConfirm = () => {
			elementorCommon.ajax.addRequest( 'enable_unfiltered_files_upload', {}, true );
			elementor.config.filesUpload.unfilteredFiles = true;
			callback();
		};

		return elementor.helpers.getSimpleDialog(
			'e-enable-unfiltered-files-dialog',
			elementor.translate( 'enable_unfiltered_files_upload' ),
			elementor.translate( 'dialog_confirm_enable_unfiltered_files_upload' ),
			elementor.translate( 'enable' ),
			onConfirm
		);
	}
}
