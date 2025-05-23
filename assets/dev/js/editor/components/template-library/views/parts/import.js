import FilesUploadHandler from '../../../../utils/files-upload-handler';

var TemplateLibraryImportView;

TemplateLibraryImportView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-import',

	id: 'elementor-template-library-import',

	ui: {
		uploadForm: '#elementor-template-library-import-form',
		fileInput: '#elementor-template-library-import-form-input',
	},

	events: {
		'change @ui.fileInput': 'onFileInputChange',
	},

	droppedFiles: null,

	submitForm() {
		let file;

		if ( this.droppedFiles ) {
			file = this.droppedFiles[ 0 ];

			this.droppedFiles = null;
		} else {
			file = this.ui.fileInput[ 0 ].files[ 0 ];

			this.ui.uploadForm[ 0 ].reset();
		}

		const fileReader = new FileReader();

		fileReader.onload = ( event ) => this.importTemplate( file.name, event.target.result.replace( /^[^,]+,/, '' ) );

		fileReader.readAsDataURL( file );
	},

	importTemplate( fileName, fileData ) {
		const layout = elementor.templates.layout;

		this.options = {
			data: {
				fileName,
				fileData,
			},
			success: ( successData ) => {
				elementor.templates.getTemplatesCollection().add( successData );

				$e.route( 'library/templates/my-templates' );
			},
			error: ( errorData ) => {
				elementor.templates.showErrorDialog( errorData );

				layout.showImportView();
			},
			complete: () => {
				layout.hideLoadingView();
			},
		};

		if ( ! elementorCommon.config.filesUpload.unfilteredFiles ) {
			const enableUnfilteredFilesModal = FilesUploadHandler.getUnfilteredFilesNotEnabledImportTemplateDialog( () => this.sendImportRequest() );

			enableUnfilteredFilesModal.show();
		} else {
			this.sendImportRequest();
		}
	},

	sendImportRequest() {
		elementorCommon.ajax.addRequest( 'import_template', this.options );

		elementor.templates.layout.showLoadingView();
	},

	onRender() {
		this.ui.uploadForm.on( {
			'drag dragstart dragend dragover dragenter dragleave drop': this.onFormActions.bind( this ),
			dragenter: this.onFormDragEnter.bind( this ),
			'dragleave drop': this.onFormDragLeave.bind( this ),
			drop: this.onFormDrop.bind( this ),
		} );
	},

	onFormActions( event ) {
		event.preventDefault();
		event.stopPropagation();
	},

	onFormDragEnter() {
		this.ui.uploadForm.addClass( 'elementor-drag-over' );
	},

	onFormDragLeave( event ) {
		if ( jQuery( event.relatedTarget ).closest( this.ui.uploadForm ).length ) {
			return;
		}

		this.ui.uploadForm.removeClass( 'elementor-drag-over' );
	},

	onFormDrop( event ) {
		this.droppedFiles = event.originalEvent.dataTransfer.files;

		this.submitForm();
	},

	onFileInputChange() {
		this.submitForm();
	},
} );

module.exports = TemplateLibraryImportView;
