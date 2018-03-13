var TemplateLibraryHeaderView = require( 'elementor-templates/views/parts/header' ),
	TemplateLibraryHeaderLogoView = require( 'elementor-templates/views/parts/header-parts/logo' ),
	TemplateLibraryLoadingView = require( 'elementor-templates/views/parts/loading' );

module.exports = Marionette.LayoutView.extend( {
	el: function() {
		return this.modal.getElements( 'widget' );
	},

	modal: null,

	regions: function() {
		return {
			modalHeader: '.dialog-widget-header',
			modalContent: '.dialog-lightbox-content'
		};
	},

	constructor: function() {
		this.initModal();

		Marionette.LayoutView.prototype.constructor.apply( this, arguments );
	},

	initialize: function() {
		this.modalHeader.show( new TemplateLibraryHeaderView() );
	},

	initModal: function() {
		var modalOptions = {
			className: 'elementor-templates-modal',
			closeButton: false,
			hide: {
				onOutsideClick: false
			}
		};

		jQuery.extend( true, modalOptions, this.getModalOptions() );

		this.modal = elementor.dialogsManager.createWidget( 'lightbox', modalOptions );

		this.modal.getElements( 'message' ).append( this.modal.addElement( 'content' ) );
	},

	showModal: function() {
		this.modal.show();
	},

	hideModal: function() {
		this.modal.hide();
	},

	getModalOptions: function() {
		return {};
	},

	getLogoOptions: function() {
		return {};
	},

	getHeaderView: function() {
		return this.modalHeader.currentView;
	},

	showLoadingView: function() {
		this.modalContent.show( new TemplateLibraryLoadingView() );
	},

	showLogo: function() {
		this.getHeaderView().logoArea.show( new TemplateLibraryHeaderLogoView( this.getLogoOptions() ) );
	}
} );
