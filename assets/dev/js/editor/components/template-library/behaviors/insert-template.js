var InsertTemplateHandler;

InsertTemplateHandler = Marionette.Behavior.extend( {
	ui: {
		insertButton: '.elementor-template-library-template-insert'
	},

	events: {
		'click @ui.insertButton': 'onInsertButtonClick'
	},

	onInsertButtonClick: function() {
		if ( this.view.model.get( 'hasPageSettings' ) ) {
			InsertTemplateHandler.showImportDialog( this.view.model );
			return;
		}

		elementor.templates.importTemplate( this.view.model );
	}
}, {
	dialog: null,

	showImportDialog: function( model ) {
		var dialog = InsertTemplateHandler.getDialog();

		dialog.onConfirm = function() {
			elementor.templates.importTemplate( model, { withPageSettings: true } );
		};

		dialog.onCancel = function() {
			elementor.templates.importTemplate( model );
		};

		dialog.show();
	},

	initDialog: function() {
		var message = elementor.translate( 'import_template_dialog_message' );

		message += '<div class="elementor-dialog-note">' + elementor.translate( 'import_template_dialog_message_attention' ) + '</div>';

		InsertTemplateHandler.dialog = elementor.dialogsManager.createWidget( 'confirm', {
			id: 'elementor-insert-template-settings-dialog',
			headerMessage: elementor.translate( 'import_template_dialog_header' ),
			message: message,
			strings: {
				confirm: elementor.translate( 'yes' ),
				cancel: elementor.translate( 'no' )
			}
		} );
	},

	getDialog: function() {
		if ( ! InsertTemplateHandler.dialog ) {
			InsertTemplateHandler.initDialog();
		}

		return InsertTemplateHandler.dialog;
	}
} );

module.exports = InsertTemplateHandler;
