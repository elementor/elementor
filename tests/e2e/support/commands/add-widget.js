/// <reference types="Cypress" />

const setPanelSelectedElement = ( elementor, category, name ) => {
	const elementsPanel = elementor.getPanelView().getCurrentPageView().elements.currentView,
		basicElements = elementsPanel.collection.findWhere( { name: category } ),
		view = elementsPanel.children.findByModel( basicElements ),
		widget = view.children.findByModel( view.collection.findWhere( { widgetType: name } ) );

	elementor.channels.panelElements.reply( 'element:selected', widget );
};

function addWidget( category, widgetName ) {
	cy.get( '#elementor-panel-header-add-button' ).click();
	cy.window().then( ( win ) => {
		const previewView = win.elementor.getPreviewView(),
			firstSectionModel = previewView.collection.first(),
			firstSectionView = previewView.children.findByModel( firstSectionModel ),
			firstColumnModel = firstSectionModel.get( 'elements' ).first(),
			firstColumnView = firstSectionView.children.findByModel( firstColumnModel );
		setPanelSelectedElement( win.elementor, category, widgetName );
		firstColumnView.addElementFromPanel( { at: 0 } );
		return firstColumnView;
	} );
}

Cypress.Commands.add( 'addWidget', addWidget );
