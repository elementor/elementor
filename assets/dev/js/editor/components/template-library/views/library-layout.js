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
	getModalOptions() {
		return {
			id: 'elementor-template-library-modal',
		};
	},

	getLogoOptions() {
		return {
			title: __( 'Library', 'elementor' ),
			click() {
				$e.run( 'library/open', { toDefault: true } );
			},
		};
	},

	getTemplateActionButton( templateData ) {
		const subscriptionPlans = elementor.config.library_connect.subscription_plans,
			baseAccessLevel = elementor.config.library_connect.base_access_level,
			// TODO: find a proper solution for this - probably replace with access_tier.
			templateAccessLevel = 1 === templateData.accessLevel ? 15 : templateData.accessLevel;

		let viewId = '#tmpl-elementor-template-library-' + ( baseAccessLevel !== templateAccessLevel ? 'upgrade-plan-button' : 'insert-button' );

		viewId = elementor.hooks.applyFilters( 'elementor/editor/template-library/template/action-button', viewId, templateData );

		const template = Marionette.TemplateCache.get( viewId );

		// TODO: check if still needed: subscriptionPlans[ 1 ]
		const subscriptionPlan = subscriptionPlans[ templateAccessLevel ] ?? subscriptionPlans[ 1 ]; // 1 is Pro plan.

		return Marionette.Renderer.render( template, {
			promotionText: `Upgrade`,
			promotionLink: subscriptionPlan.promotion_url,
		} );
	},

	setHeaderDefaultParts() {
		var headerView = this.getHeaderView();

		headerView.tools.show( new TemplateLibraryHeaderActionsView() );
		headerView.menuArea.show( new TemplateLibraryHeaderMenuView() );

		this.showLogo();
	},

	showTemplatesView( templatesCollection ) {
		this.modalContent.show( new TemplateLibraryCollectionView( {
			collection: templatesCollection,
		} ) );
	},

	showImportView() {
		const headerView = this.getHeaderView();

		headerView.menuArea.reset();

		this.modalContent.show( new TemplateLibraryImportView() );

		headerView.logoArea.show( new TemplateLibraryHeaderBackView() );
	},

	showConnectView( args ) {
		this.getHeaderView().menuArea.reset();

		this.modalContent.show( new TemplateLibraryConnectView( args ) );
	},

	showSaveTemplateView( elementModel ) {
		this.getHeaderView().menuArea.reset();

		this.modalContent.show( new TemplateLibrarySaveTemplateView( { model: elementModel } ) );
	},

	showPreviewView( templateModel ) {
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
