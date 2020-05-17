export default class FilesUploadEnabler {
	static isUploadEnabled( mediaType ) {
		if ( 'application/json' === mediaType ) {
			mediaType = 'json';
		}

		if ( undefined === elementor.config.is_unfiltered_files_upload_enabled[ mediaType ] ) {
			return true;
		}

		return elementor.config.is_unfiltered_files_upload_enabled[ mediaType ] || FilesUploadEnabler.isFilesUploadDialogConfirmed;
	}

	static uploadTypeCaller( frame ) {
		frame.uploader.uploader.param( 'uploadTypeCaller', 'elementor-editor-upload' );
	}

	static getUnfilteredFilesNotEnabledDialog( callback ) {
		const onConfirm = () => {
			elementorCommon.ajax.addRequest( 'enable_unfiltered_files_upload', {}, true );
			FilesUploadEnabler.isFilesUploadDialogConfirmed = true;
			callback();
		};

		return elementor.helpers.getSimpleDialog(
			'elementor-enable-svg-dialog',
			elementor.translate( 'enable_unfiltered_files_upload' ),
			elementor.translate( 'dialog_confirm_enable_unfiltered_files_upload' ),
			elementor.translate( 'enable' ),
			onConfirm
		);
	}
}
