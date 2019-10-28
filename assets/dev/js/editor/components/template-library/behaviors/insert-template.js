var InsertTemplateHandler;

InsertTemplateHandler = Marionette.Behavior.extend( {
	ui: {
		insertButton: '.elementor-template-library-template-insert',
	},

	events: {
		'click @ui.insertButton': 'onInsertButtonClick',
	},

	onInsertButtonClick: function() {
		const args = {
			model: this.view.model,
		};

		if ( ! elementor.config.connect.is_connected ) {
			$e.route( 'library/connect', args );
			return;
		}

		$e.run( 'library/insert-template', args );
	},
} );

module.exports = InsertTemplateHandler;
