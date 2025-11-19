const TemplateLibrarySaveTemplateView = require( './save-template' );

const TemplateLibrarySaveTemplateVariantBView = TemplateLibrarySaveTemplateView.extend( {
	id: 'elementor-template-library-save-template-variant-b',

	template: '#tmpl-elementor-template-library-save-template-variant-b',

	ui() {
		return _.extend( TemplateLibrarySaveTemplateView.prototype.ui.apply( this, arguments ), {
			selectFolderLink: '.select-folder-link',
			cloudAccountBadge: '.cloud-account-badge',
		} );
	},

	events() {
		return _.extend( TemplateLibrarySaveTemplateView.prototype.events.apply( this, arguments ), {
			'input @ui.selectFolderLink': 'onEllipsisIconClick',
		} );
	},

	handleElementorConnect() {
		elementor.templates.eventManager.sendPageViewEvent( {
			location: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.saveModalSelectConnect,
		} );

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
} );

module.exports = TemplateLibrarySaveTemplateVariantBView;

