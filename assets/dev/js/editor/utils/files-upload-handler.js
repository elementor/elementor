export default class FilesUploadHandler {
	static isUploadEnabled( mediaType ) {
		const unfilteredFilesTypes = [ 'svg', 'application/json' ];

		if ( ! unfilteredFilesTypes.includes( mediaType ) ) {
			return true;
		}

		return elementorCommon.config.filesUpload.unfilteredFiles;
	}

	static setUploadTypeCaller( frame ) {
		frame.uploader.uploader.param( 'uploadTypeCaller', 'elementor-wp-media-upload' );
	}

	static getUnfilteredFilesNonAdminDialog() {
		return elementorCommon.dialogsManager.createWidget( 'alert', {
			id: 'e-unfiltered-files-disabled-dialog',
			headerMessage: __( 'Sorry, you can\'t upload that file yet', 'elementor' ),
			message: __( 'This is because JSON files may pose a security risk.', 'elementor' ) +
				'<br><br>' +
				__( 'To upload them anyway, ask the site administrator to enable unfiltered file uploads.', 'elementor' ),
			strings: {
				confirm: __( 'Got it', 'elementor' ),
			},
		} );
	}

	static getUnfilteredFilesNotEnabledDialog( callback ) {
		const elementorInstance = window.elementorAdmin || window.elementor;

		if ( ! elementorInstance.config.user.is_administrator ) {
			return this.getUnfilteredFilesNonAdminDialog();
		}

		const onConfirm = () => {
			elementorCommon.ajax.addRequest( 'enable_unfiltered_files_upload', {}, true );
			elementorCommon.config.filesUpload.unfilteredFiles = true;
			callback();
		};

		return elementorInstance.helpers.getSimpleDialog(
			'e-enable-unfiltered-files-dialog',
			__( 'Enable Unfiltered File Uploads', 'elementor' ),
			__( 'Before you enable unfiltered files upload, note that such files include a security risk. Elementor does run a process to remove possible malicious code, but there is still risk involved when using such files.', 'elementor' ),
			__( 'Enable', 'elementor' ),
			onConfirm,
		);
	}

	static getUnfilteredFilesNotEnabledImportTemplateDialog( callback ) {
		if ( ! ( window.elementorAdmin || window.elementor ).config.user.is_administrator ) {
			return this.getUnfilteredFilesNonAdminDialog();
		}

		return elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'e-enable-unfiltered-files-dialog-import-template',
			headerMessage: __( 'Enable Unfiltered File Uploads', 'elementor' ),
			message: __( 'Before you enable unfiltered files upload, note that such files include a security risk. Elementor does run a process to remove possible malicious code, but there is still risk involved when using such files.', 'elementor' ) +
				'<br /><br />' +
				__( 'If you do not enable uploading unfiltered files, any SVG or JSON (including lottie) files used in the uploaded template will not be imported.', 'elementor' ),
			position: {
				my: 'center center',
				at: 'center center',
			},
			strings: {
				confirm: __( 'Enable and Import', 'elementor' ),
				cancel: __( 'Import Without Enabling', 'elementor' ),
			},
			onConfirm: () => {
				elementorCommon.ajax.addRequest( 'enable_unfiltered_files_upload', {
					success: () => {
						// This utility is used in both the admin and the Editor.
						elementorCommon.config.filesUpload.unfilteredFiles = true;

						callback();
					},
				}, true );
			},
			onCancel: () => callback(),
		} );
	}
}
