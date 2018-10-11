/// <reference types="Cypress" />

var setPanelSelectedElement = function( elementor, category, name ) {
	var elementsPanel = elementor.getPanelView().getCurrentPageView().elements.currentView,
		basicElements = elementsPanel.collection.findWhere( { name: category } ),
		view = elementsPanel.children.findByModel( basicElements ),
		widget = view.children.findByModel( view.collection.findWhere( { widgetType: name } ) );

	elementor.channels.panelElements.reply( 'element:selected', widget );
};

describe( 'Test Auto Save', () => {
	it( 'add page', () => {
		cy.visit( '/wp-admin' );

		cy.addPage();

		cy.window().then( ( win ) => {
			var previewView = win.elementor.getPreviewView(),
				firstSectionModel = previewView.collection.first(),
				firstSectionView = previewView.children.findByModel( firstSectionModel ),
				firstColumnModel = firstSectionModel.get( 'elements' ).first(),
				firstColumnView = firstSectionView.children.findByModel( firstColumnModel );
			setPanelSelectedElement( win.elementor, 'basic', 'heading' );
			firstColumnView.addElementFromPanel( { at: 0 } );
		} );

		cy.get( 'textarea[data-setting="title"]' )
			.clear()
			.type( 'Publish' )
			.get( '#elementor-panel-saver-button-publish' )
			.click()
			.get( 'textarea[data-setting="title"]' )
			.clear()
			.type( 'AutoSave' );

		cy.get( '#elementor-panel-saver-button-save-options' ).click();
		cy.get( '.elementor-last-edited-wrapper .elementor-state-icon' )
			.should( 'be.visible' ).wait( 1000 )
			.window()
			.then( ( win ) => {
				win.elementor.channels.editor.reply( 'status', false );
			} ).reload();

		cy.window().then( ( win ) => {
			var previewView = win.elementor.getPreviewView(),
				firstWidgetModel = previewView.collection
					.first()
					.get( 'elements' )
					.first()
					.get( 'elements' )
					.first();

			expect( firstWidgetModel.get( 'settings' ).get( 'title' ) ).to.eql( 'AutoSave' );
		} );

		cy.get( '#elementor-panel-footer-history' )
			.click()
			.get( '#elementor-panel-elements-navigation-revisions' )
			.click();

		cy.window().then( ( win ) => {
			win.jQuery( '.elementor-revision-item__tools-delete' ).css( 'display', 'block' );
		} );

		cy.get( '.elementor-revision-item__tools-delete' )
			.first()
			.click();

		cy.get( '.dialog-confirm-buttons-wrapper .dialog-confirm-ok' ).click();

		cy.window().then( ( win ) => {
			var previewView = win.elementor.getPreviewView(),
				firstWidgetModel = previewView.collection
					.first().get( 'elements' ).first().get( 'elements' ).first();

			expect( firstWidgetModel.get( 'settings' ).get( 'title' ) ).to.eql( 'Publish' );
		} );
	} );
} );
