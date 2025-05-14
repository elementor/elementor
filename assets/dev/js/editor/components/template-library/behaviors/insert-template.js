var InsertTemplateHandler;

InsertTemplateHandler = Marionette.Behavior.extend( {
	ui: {
		insertButton: '.elementor-template-library-template-insert',
	},

	events: {
		'click @ui.insertButton': 'onInsertButtonClick',
	},

	onRender() {
		this.ui.insertButton.toggleClass( 'disabled', this.view.model.isLocked() );
	},

	onInsertButtonClick( e ) {
		if ( 'locked' === this.view.model.get( 'status' ) ) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}

		const args = {
			model: this.view.model,
		};

		this.ui.insertButton.addClass( 'elementor-disabled' );

		if ( 'remote' === args.model.get( 'source' ) && ! elementor.config.library_connect.is_connected ) {
			$e.route( 'library/connect', args );
			return;
		}

		$e.run( 'library/insert-template', args );
	},
} );

module.exports = InsertTemplateHandler;
