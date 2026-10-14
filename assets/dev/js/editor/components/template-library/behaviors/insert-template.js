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
		const activeSource = args.model.get( 'source' );

		/**
		 * Filter template source.
		 *
		 * @param bool   isRemote     - If `true` the source is a remote source.
		 * @param string activeSource - The current template source.
		 */
		const isRemote = elementor.hooks.applyFilters( 'templates/source/is-remote', 'remote' === activeSource, activeSource );

		if ( isRemote && ! elementor.config.library_connect.is_connected ) {
			$e.route( 'library/connect', args );
			return;
		}

		$e.run( 'library/insert-template', args );
	},
} );

module.exports = InsertTemplateHandler;
