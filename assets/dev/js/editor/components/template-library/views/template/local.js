var TemplateLibraryTemplateView = require( 'elementor-templates/views/template/base' ),
	TemplateLibraryTemplateLocalView;

var dialog;

TemplateLibraryTemplateLocalView = TemplateLibraryTemplateView.extend( {
	template: '#tmpl-elementor-template-library-template-local',

	ui: function() {
		return _.extend( TemplateLibraryTemplateView.prototype.ui.apply( this, arguments ), {
			deleteButton: '.elementor-template-library-template-delete'
		} );
	},

	events: function() {
		return _.extend( TemplateLibraryTemplateView.prototype.events.apply( this, arguments ), {
			'click @ui.deleteButton': 'onDeleteButtonClick'
		} );
	},

	initDialog: function() {
		var self = this;

		dialog = elementor.dialogsManager.createWidget( 'confirm', {
			headerMessage: elementor.translate( 'import_template_dialog_header' ),
			message: elementor.translate( 'import_template_dialog_message' ),
			strings: {
				confirm: elementor.translate( 'yes' ),
				cancel: elementor.translate( 'no' )
			},
			onConfirm: function() {
				elementor.templates.importTemplate( self.model, true );
			},
			onCancel: function() {
				TemplateLibraryTemplateView.prototype.insert.apply( self, arguments );
			}
		} );
	},

	getDialog: function() {
		if ( ! dialog ) {
			this.initDialog();
		}

		return dialog;
	},

	insert: function() {
		if ( 'page' === this.model.get( 'type' ) ) {
			this.getDialog().show();
		} else {
			TemplateLibraryTemplateView.prototype.insert.apply( this, arguments );
		}
	},

	onDeleteButtonClick: function() {
		elementor.templates.deleteTemplate( this.model );
	},

	onPreviewButtonClick: function() {
		open( this.model.get( 'url' ), '_blank' );
	}
} );

module.exports = TemplateLibraryTemplateLocalView;
