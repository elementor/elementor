var TemplateLibraryHeaderActionsView = require( 'elementor-templates/views/parts/header-parts/actions' ),
	TemplateLibraryHeaderMenuView = require( 'elementor-templates/views/parts/header-parts/menu' ),
	TemplateLibraryHeaderPreviewView = require( 'elementor-templates/views/parts/header-parts/preview' ),
	TemplateLibraryHeaderBackView = require( 'elementor-templates/views/parts/header-parts/back' ),
	TemplateLibraryCollectionView = require( 'elementor-templates/views/parts/templates' ),
	TemplateLibrarySaveTemplateView = require( 'elementor-templates/views/parts/save-template' ),
	TemplateLibraryImportView = require( 'elementor-templates/views/parts/import' ),
	TemplateLibraryConnectView = require( 'elementor-templates/views/parts/connect' ),
	TemplateLibraryPreviewView = require( 'elementor-templates/views/parts/preview' );

module.exports = elementorModules.common.views.modal.Layout.extend( {
	getModalOptions: function() {
		return {
			id: 'elementor-template-library-modal',
		};
	},

	getLogoOptions: function() {
		return {
			title: __( 'Library', 'elementor' ),
			click: function() {
				$e.run( 'library/open', { toDefault: true } );
			},
		};
	},

	getTemplateActionButton: function( templateData ) {
		const accessLevels = elementor.config.library_connect.access_levels;

		var viewId = '#tmpl-elementor-template-library-' + ( accessLevels.core !== templateData.accessLevel ? 'upgrade-plan-button' : 'insert-button' );

		viewId = elementor.hooks.applyFilters( 'elementor/editor/template-library/template/action-button', viewId, templateData );

		var template = Marionette.TemplateCache.get( viewId );

		// In case the access level of the template is not one of the defined.
		// it will find the next access level that was defined.
		// Example: access_level = 15, and access_level 15 is not exists in the plans the button will be "Go Expert" which is 20
		const closestAccessLevel = Object.values( accessLevels )
			.sort()
			.find( ( accessLevel ) => {
				return accessLevel >= templateData.accessLevel;
			} );

		const config = {
			[ accessLevels.core ]: null, // Core does not need params to its view.
			[ accessLevels.pro ]: {
				buttonText: __( 'Go Pro', 'elementor' ),
				utmCampaign: 'gopro',
			},
			[ accessLevels.expert ]: {
				buttonText: __( 'Go Expert', 'elementor' ),
				utmCampaign: 'goexpert',
			},
		};

		return Marionette.Renderer.render( template, config[ closestAccessLevel ] );
	},

	setHeaderDefaultParts: function() {
		var headerView = this.getHeaderView();

		headerView.tools.show( new TemplateLibraryHeaderActionsView() );
		headerView.menuArea.show( new TemplateLibraryHeaderMenuView() );

		this.showLogo();
	},

	showTemplatesView: function( templatesCollection ) {
		this.modalContent.show( new TemplateLibraryCollectionView( {
			collection: templatesCollection,
		} ) );
	},

	showImportView: function() {
		const headerView = this.getHeaderView();

		headerView.menuArea.reset();

		this.modalContent.show( new TemplateLibraryImportView() );

		headerView.logoArea.show( new TemplateLibraryHeaderBackView() );
	},

	showConnectView: function( args ) {
		this.getHeaderView().menuArea.reset();

		this.modalContent.show( new TemplateLibraryConnectView( args ) );
	},

	showSaveTemplateView: function( elementModel ) {
		this.getHeaderView().menuArea.reset();

		this.modalContent.show( new TemplateLibrarySaveTemplateView( { model: elementModel } ) );
	},

	showPreviewView: function( templateModel ) {
		this.modalContent.show( new TemplateLibraryPreviewView( {
			url: templateModel.get( 'url' ),
		} ) );

		var headerView = this.getHeaderView();

		headerView.menuArea.reset();

		headerView.tools.show( new TemplateLibraryHeaderPreviewView( {
			model: templateModel,
		} ) );

		headerView.logoArea.show( new TemplateLibraryHeaderBackView() );
	},
} );
