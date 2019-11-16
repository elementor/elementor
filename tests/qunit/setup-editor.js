elementorCommon.ajax.send = ( action, options ) => {};

/* global jQuery */
const ElementorConfig = {
	document: { remoteLibrary: {}, urls: {}, panel: { widgets_settings: {} } },
	user: { introduction: {}, restrictions: [] },
	elements: {},
	dynamicTags: {},
	icons: { libraries: [] },
	settings: { page: new Backbone.Model },
	schemes: {},
	controls: {
		repeater: {
			item_actions: { add: true, duplicate: true, remove: true, sort: true },
		},
	},
	autosave_interval: 1000,
};

const elementorFrontend = {
	elements: {
		window,
		$window: jQuery( window ),
	},
	config: { elements: { data: {}, editSettings: {} }, breakpoints: {} },
	isEditMode: () => {
	},
	elementsHandler: {
		runReadyTrigger: () => {
		},
	},
};

const originalGet = Marionette.TemplateCache.get;

Marionette.TemplateCache.get = function( template ) {
	if ( jQuery( template ).length ) {
		return originalGet.apply( Marionette.TemplateCache, [ template ] );
	}

	return () => `<div class="${ template }"></div>`;
};

Marionette.Region.prototype._ensureElement = () => {
	return true;
};

Marionette.Region.prototype.attachHtml = () => {
};

Marionette.CompositeView.prototype.getChildViewContainer = ( containerView ) => {
	containerView.$childViewContainer = jQuery( '<div />' );
	containerView.$childViewContainer.appendTo( '#qunit-fixture' );
	return containerView.$childViewContainer;
};

fixture.setBase( 'tests/qunit' );

QUnit.testStart( ( { module, name } ) => {
	fixture.load( 'index.html' );
} );

QUnit.testDone( ( { module, name } ) => {
	fixture.cleanup();
} );
