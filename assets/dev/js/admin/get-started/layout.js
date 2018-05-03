var BaseModalLayout = require( 'elementor-templates/views/base-modal-layout' ),
	GetStartedView = require( 'elementor-admin/get-started/view' );

module.exports = BaseModalLayout.extend( {

	getModalOptions: function() {

		return {
			id: 'elementor-get-started-modal'
		};
	},

	getLogoOptions: function() {

		return {
			title: elementorAdmin.config.i18n.get_started
		};
	},

	getHeaderOptions: function() {

		return {
			closeType: 'skip'
		};
	},

	initialize: function() {
		BaseModalLayout.prototype.initialize.apply( this, arguments );

		this.showLogo();

		this.showContentView();
	},

	getDialogsManager: function() {
		return elementorAdmin.getDialogsManager();
	},

	showContentView: function() {
		this.modalContent.show( new GetStartedView() );
	}
} );
