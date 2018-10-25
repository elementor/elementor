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
			modalHeader: '.dialog-header',
			modalContent: '.dialog-lightbox-content',
			modalLoading: '.dialog-lightbox-loading',
		};
	},

	constructor: function() {
		this.initModal();

		Marionette.LayoutView.prototype.constructor.apply( this, arguments );
	},

	initialize: function() {
		this.modalHeader.show( new TemplateLibraryHeaderView( this.getHeaderOptions() ) );
	},

	initModal: function() {
		var modalOptions = {
			className: 'elementor-templates-modal',
			closeButton: false,
			draggable: false,
			hide: {
				onOutsideClick: false,
			},
		};

		jQuery.extend( true, modalOptions, this.getModalOptions() );

		this.modal = elementorCommon.dialogsManager.createWidget( 'lightbox', modalOptions );

		this.modal.getElements( 'message' ).append( this.modal.addElement( 'content' ), this.modal.addElement( 'loading' ) );

		if ( modalOptions.draggable ) {
			this.draggableModal();
		}
	},

	showModal: function() {
		this.modal.show();
	},

	hideModal: function() {
		this.modal.hide();
	},

	draggableModal: function() {
		const $modalWidgetContent = this.modal.getElements( 'widgetContent' );

		$modalWidgetContent.draggable( {
			containment: 'parent',
			stop: () => {
				$modalWidgetContent.height( '' );
			},
		} );

		$modalWidgetContent.css( 'position', 'absolute' );
	},

	getModalOptions: function() {
		return {};
	},

	getLogoOptions: function() {
		return {};
	},

	getHeaderOptions: function() {
		return {
			closeType: 'normal',
		};
	},

	getHeaderView: function() {
		return this.modalHeader.currentView;
	},

	showLoadingView: function() {
		this.modalLoading.show( new TemplateLibraryLoadingView() );

		this.modalLoading.$el.show();

		this.modalContent.$el.hide();
	},

	hideLoadingView: function() {
		this.modalContent.$el.show();

		this.modalLoading.$el.hide();
	},

	showLogo: function() {
		this.getHeaderView().logoArea.show( new TemplateLibraryHeaderLogoView( this.getLogoOptions() ) );
	},
} );
