var TemplateLibraryImportView;

TemplateLibraryImportView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-import',

	id: 'elementor-template-library-import',

	ui: {
		uploadForm: '#elementor-template-library-import-form',
		fileInput: '#elementor-template-library-import-form-input'
	},

	events: {
		'change @ui.fileInput': 'onFileInputChange'
	},

	droppedFiles: null,

	submitForm: function() {
		var layout = elementor.templates.getLayout(),
			data = new FormData();

		if ( this.droppedFiles ) {
			data.append( 'file', this.droppedFiles[0] );

			this.droppedFiles = null;
		} else {
			data.append( 'file', this.ui.fileInput[0].files[0] );

			this.ui.uploadForm[0].reset();
		}

		var options = {
			data: data,
			processData: false,
			contentType: false,
			success: function( data ) {
				elementor.templates.getTemplatesCollection().add( data );

				elementor.templates.setTemplatesPage( 'local' );
			},
			error: function( data ) {
				elementor.templates.showErrorDialog( data );

				layout.showImportView();
			}
		};

		elementor.ajax.send( 'import_template', options );

		layout.showLoadingView();
	},

	onRender: function() {
		this.ui.uploadForm.on( {
			'drag dragstart dragend dragover dragenter dragleave drop': this.onFormActions.bind( this ),
			dragenter: this.onFormDragEnter.bind( this ),
			'dragleave drop': this.onFormDragLeave.bind( this ),
			drop: this.onFormDrop.bind( this )
		} );
	},

	onFormActions: function( event ) {
		event.preventDefault();
		event.stopPropagation();
	},

	onFormDragEnter: function() {
		this.ui.uploadForm.addClass( 'elementor-drag-over' );
	},

	onFormDragLeave: function( event ) {
		if ( jQuery( event.relatedTarget ).closest( this.ui.uploadForm ).length ) {
			return;
		}

		this.ui.uploadForm.removeClass( 'elementor-drag-over' );
	},

	onFormDrop: function( event ) {
		this.droppedFiles = event.originalEvent.dataTransfer.files;

		this.submitForm();
	},

	onFileInputChange: function() {
		this.submitForm();
	}
} );

module.exports = TemplateLibraryImportView;
