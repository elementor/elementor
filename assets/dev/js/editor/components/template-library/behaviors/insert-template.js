module.exports = Marionette.Behavior.extend( {
	ui: {
		insertButton: '.elementor-template-library-template-insert'
	},

	events: {
		'click @ui.insertButton': 'onInsertButtonClick'
	},

	onInsertButtonClick: function() {
		var action = this.ui.insertButton.data( 'action' );

		if ( 'insert' === action ) {
			elementor.templates.importTemplate( this.view.model );
		} else {
			open( elementor.config.pro_library_url, '_blank' );
		}
	}
} );
