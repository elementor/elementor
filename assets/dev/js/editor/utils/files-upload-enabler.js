export default class FilesUploadEnabler {
	static isUploadEnabled() {
		return elementor.config.is_unfiltered_files_upload_enabled || FilesUploadEnabler.isFilesUploadDialogConfirmed;
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
