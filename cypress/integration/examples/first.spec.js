/// <reference types="Cypress" />

var setPanelSelectedElement = function( elementor, category, name ) {
  elementor.getPanelView().setPage( 'elements' );

  var elementsPanel = elementor.getPanelView().getCurrentPageView().elements.currentView,
    basicElements = elementsPanel.collection.findWhere( { name: category } ),
    view = elementsPanel.children.findByModel( basicElements ),
    widget = view.children.findByModel( view.collection.findWhere( { widgetType: name } ) );

  elementor.channels.panelElements.reply( 'element:selected', widget );
};

describe( 'My First Test', () => {
  it( 'add page', () => {
    cy.visit( '/wp-login.php' ).wait( 100 );
    cy.get( '[id=user_login]' ).type( 'admin' );
    cy.get( '[type=password]' ).type( 'password' );
    cy.get( '[id=wp-submit]' ).click();
    cy.screenshot();

    cy.visit( '/wp-admin/post-new.php?post_type=page' );
    cy.get( '[id=content-html]' ).click();
    cy.get( '[id=content]' ).type( 'Elementor' );
    cy.get( '[id=elementor-switch-mode-button]' ).click();
    cy.get( '[id=elementor-loading]' ).should( 'be.hidden' );
    cy.screenshot();

    cy.window().then( ( win ) => {
      var previewView = win.elementor.getPreviewView(),
        firstSectionModel = previewView.collection.first(),
        firstSectionView = previewView.children.findByModel( firstSectionModel ),
        firstColumnModel = firstSectionModel.get( 'elements' ).first(),
        firstColumnView = firstSectionView.children.findByModel( firstColumnModel );
      setPanelSelectedElement( win.elementor, 'basic', 'heading' );
      firstColumnView.addElementFromPanel( { at: 0 } );
    } );
    cy.screenshot();

    cy.get( '#elementor-control-default-c395' )
      .clear()
      .type( 'Publish' )
      .get( '#elementor-panel-saver-button-publish' )
      .click()
      .get( '#elementor-control-default-c395' )
      .clear()
      .type( 'AutoSave' );
    cy.screenshot();

    cy.get( '#elementor-panel-saver-button-save-options' ).click();
    cy.screenshot();
    cy.get( '.elementor-last-edited-wrapper .elementor-state-icon' )
      .should( 'be.visible' )
      .wait( 1000 )
      .reload();

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
          .first()
          .get( 'elements' )
          .first()
          .trigger( 'mouseover' )
          .trigger( 'mouseenter' )
          .get( 'elements' )
          .first();

      expect( firstWidgetModel.get( 'settings' ).get( 'title' ) ).to.eql( 'Publish' );
    } );
  } );
} );
