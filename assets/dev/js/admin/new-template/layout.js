var NewTemplateView = require( 'elementor-admin/new-template/view' );

module.exports = elementorModules.common.views.modal.Layout.extend( {

	getModalOptions: function() {
		return {
			id: 'elementor-new-template-modal',
		};
	},

	getLogoOptions: function() {
		return {
			title: __( 'New Template', 'elementor' ),
		};
	},

	initialize: function() {
		elementorModules.common.views.modal.Layout.prototype.initialize.apply( this, arguments );

		this.showLogo();

		this.showContentView();
	},

	showContentView: function() {
		this.modalContent.show( new NewTemplateView() );
	},
} );
