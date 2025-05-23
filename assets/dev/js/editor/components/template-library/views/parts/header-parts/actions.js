module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-actions',

	id: 'elementor-template-library-header-actions',

	ui: {
		import: '#elementor-template-library-header-import i',
		sync: '#elementor-template-library-header-sync i',
		save: '#elementor-template-library-header-save i',
	},

	events: {
		'click @ui.import': 'onImportClick',
		'click @ui.sync': 'onSyncClick',
		'click @ui.save': 'onSaveClick',
	},

	onImportClick() {
		$e.route( 'library/import' );
	},

	onSyncClick() {
		var self = this;

		self.ui.sync.addClass( 'eicon-animation-spin' );

		elementor.templates.requestLibraryData( {
			onUpdate() {
				self.ui.sync.removeClass( 'eicon-animation-spin' );

				$e.routes.refreshContainer( 'library' );
			},
			forceUpdate: true,
			forceSync: true,
		} );
	},

	onSaveClick() {
		$e.route( 'library/save-template' );
	},
} );
