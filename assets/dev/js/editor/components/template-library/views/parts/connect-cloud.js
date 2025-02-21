module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-connect-cloud',

	id: 'elementor-template-library-connect-cloud',

	ui: {
		connect: '#elementor-template-library-connect__button',
		selectSourceFilter: '.elementor-template-library-filter-select-source',
	},

	events: {
		'change @ui.selectSourceFilter': 'onSelectSourceFilterChange',
	},

	templateHelpers() {
		return this.getOption( 'texts' );
	},

	onRender() {
		this.ui.connect.elementorConnect( {
			success: () => {
				elementor.config.library_connect.is_connected = true;

				$e.run( 'library/close' );
				elementor.notifications.showToast( {
					message: __( 'Connected successfully.', 'elementor' ),
				} );
			},
			error: () => {
				elementor.config.library_connect.is_connected = false;
			},
		} );
	},

	onSelectSourceFilterChange( event ) {
		elementor.templates.onSelectSourceFilterChange( event );
	},
} );
