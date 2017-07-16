var elementorTests = {};

elementorTests.setPanelSelectedElement = function( category, name ) {
	elementor.getPanelView().setPage( 'elements' );

	var elementsPanel = elementor.getPanelView().getCurrentPageView().elements.currentView,
		basicElements = elementsPanel.collection.findWhere( { name: category } ),
		view = elementsPanel.children.findByModel( basicElements ),
		headingWidget = view.children.findByModel( view.collection.findWhere( { widgetType: name } ) );

	elementor.channels.panelElements.reply( 'element:selected', headingWidget );
};

QUnit.module( 'Loading' );

QUnit.test( 'Elementor exist', function( assert ) {
	assert.ok( elementor, 'Passed!' );
});

QUnit.test( 'Preview loaded', function( assert ) {
	assert.equal( 1, elementor.$previewContents.find( '.elementor-editor-active' ).length );
});

QUnit.test( 'Frontend CSS loaded', function( assert ) {
	assert.equal( 1, elementor.$previewContents.find( '#elementor-frontend-css' ).length );
});


function testPreview() {

	QUnit.module( 'Widgets' );

		var firstSectionModel = elementor.sections.currentView.collection.first(),
			firstSectionView = elementor.sections.currentView.children.findByModel( firstSectionModel ),
			firstColumnModel = firstSectionModel.get( 'elements' ).first(),
			firstColumnView = firstSectionView.children.findByModel( firstColumnModel ),
			elements = [
			['basic', '' ], // widget columns
			['basic', 'heading'],
			['basic', 'image'],
			// ['basic', 'text-editor'],
			['basic', 'video'],
			['basic', 'button'],
			['basic', 'divider'],
			['basic', 'spacer'],
			['basic', 'google_maps'],
			['basic', 'icon'],
			['general-elements', 'image-box'],
			['general-elements', 'icon-box'],
			['general-elements', 'image-gallery'],
			['general-elements', 'image-carousel'],
			['general-elements', 'icon-list'],
			['general-elements', 'counter'],
			['general-elements', 'progress'],
			['general-elements', 'testimonial'],
			// ['general-elements', 'tabs'],
			// ['general-elements', 'accordion'],
			// ['general-elements', 'toggle'],
			['general-elements', 'social-icons'],
			['general-elements', 'alert'],
			['general-elements', 'audio'],
			['general-elements', 'shortcode'],
			['general-elements', 'html'],
			['general-elements', 'menu-anchor'],
			['general-elements', 'sidebar'],

			['wordpress', 'wp-widget-pages'],
			['wordpress', 'wp-widget-calendar'],
			['wordpress', 'wp-widget-archives'],
			['wordpress', 'wp-widget-media_audio'],
			['wordpress', 'wp-widget-media_image'],
			['wordpress', 'wp-widget-media_video'],
			['wordpress', 'wp-widget-meta'],
			['wordpress', 'wp-widget-search'],
			['wordpress', 'wp-widget-text'],
			['wordpress', 'wp-widget-categories'],
			['wordpress', 'wp-widget-recent-posts'],
			['wordpress', 'wp-widget-recent-comments'],
			['wordpress', 'wp-widget-rss'],
			['wordpress', 'wp-widget-tag_cloud'],
			['wordpress', 'wp-widget-nav_menu'],
			['wordpress', 'wp-widget-elementor-library']
		];

		_( elements ).each(function( element ) {
			QUnit.test( 'addElementFromPanel:' + element[0] + ':' + element[1], function( assert ) {
				elementorTests.setPanelSelectedElement( element[0], element[1] );
				firstColumnView.addElementFromPanel( { at: 0 } );

				assert.equal( element[1], firstColumnView.model.get( 'elements' ).first().get( 'widgetType' ) );
			} );
		});

		QUnit.test( 'simulateDragDrop', function( assert ) {
			pQuery( '[data-id="hphgwx5"]' ).simulate( 'drag-n-drop', {
				dragTarget: pQuery( '[data-id="tvpmxwz"]' )
			} );
			assert.equal( 1, pQuery( '[data-id="tvpmxwz"]' ).find( '[data-id="hphgwx5"]' ).length );
		} );
	}

elementor.on( 'preview:loaded', function() {
	window.pQuery = elementor.$preview[0].contentWindow.jQuery;
	pQuery( elementor.$preview[0].contentDocument ).ready( testPreview );
} );
